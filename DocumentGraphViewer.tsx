import React, { useState, useMemo, useCallback } from 'react';
import { Document, Conflict } from '../types';

interface DocumentGraphViewerProps {
    documents: Document[];
    conflicts: Conflict[];
}

interface Node {
    id: string;
    label: string;
    x: number;
    y: number;
}

interface Edge {
    source: string;
    target: string;
    unresolvedConflictCount: number;
}

const width = 800;
const height = 600;

// A dedicated component for the tooltip to keep the main component cleaner
const Tooltip: React.FC<{ tooltipData: { contentLines: string[]; x: number; y: number; scale: number; } }> = ({ tooltipData }) => {
    const { contentLines, x, y, scale } = tooltipData;
    const padding = 8 / scale;
    const charWidth = 7 / scale;
    const lineHeight = 16 / scale;
    const maxWidth = Math.max(...contentLines.map(line => line.length)) * charWidth + 2 * padding;
    const totalHeight = contentLines.length * lineHeight + padding * 1.5;
    
    const offsetX = 45 / scale;

    return (
        <g transform={`translate(${x + offsetX}, ${y})`} style={{ pointerEvents: 'none' }}>
            <rect
                x={0}
                y={-totalHeight / 2}
                width={maxWidth}
                height={totalHeight}
                rx={5 / scale}
                ry={5 / scale}
                fill="rgba(26, 32, 44, 0.9)"
                stroke="#4299e1"
                strokeWidth={1.5 / scale}
            />
            {contentLines.map((line, i) => (
                <text
                    key={i}
                    x={padding}
                    y={(-totalHeight / 2) + (padding / 2) + (i * lineHeight) + (lineHeight / 2)}
                    fill="white"
                    fontSize={12 / scale}
                    className="font-sans"
                    dominantBaseline="middle"
                >
                    {line}
                </text>
            ))}
        </g>
    );
};


const DocumentGraphViewer: React.FC<DocumentGraphViewerProps> = ({ documents, conflicts }) => {
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
    const [transform, setTransform] = useState({ x: 0, y: 0, k: 1 });
    const [isPanning, setIsPanning] = useState(false);
    const [panStart, setPanStart] = useState({ x: 0, y: 0 });
    const [tooltip, setTooltip] = useState<{ contentLines: string[], x: number, y: number } | null>(null);


    // FIX: Add explicit return type to useMemo to ensure correct type inference for nodes and edges.
    const { nodes, edges, nodeConflictCounts } = useMemo((): { nodes: Node[]; edges: Edge[]; nodeConflictCounts: Map<string, number> } => {
        if (documents.length === 0) {
            return { nodes: [], edges: [], nodeConflictCounts: new Map() };
        }

        const radius = 250;
        const centerX = width / 2;
        const centerY = height / 2;
        const angleStep = documents.length > 0 ? (2 * Math.PI) / documents.length : 0;

        const calculatedNodes: Node[] = documents.map((doc, i) => ({
            id: doc.id,
            label: doc.title,
            x: centerX + radius * Math.cos(i * angleStep - Math.PI / 2),
            y: centerY + radius * Math.sin(i * angleStep - Math.PI / 2),
        }));
        
        const edgeMap = new Map<string, Edge>();
        const calculatedNodeConflictCounts = new Map<string, number>();

        documents.forEach(doc => {
            const count = conflicts.filter(c => c.documentIds.includes(doc.id)).length;
            calculatedNodeConflictCounts.set(doc.id, count);
        });

        conflicts.forEach(conflict => {
            // Create a sorted copy to generate a consistent key, preventing prop mutation.
            const sortedIds = [...conflict.documentIds].sort();
            const key = `${sortedIds[0]}-${sortedIds[1]}`;

            if (!edgeMap.has(key)) {
                // Use the original, unsorted IDs for source and target to maintain consistency.
                edgeMap.set(key, {
                    source: conflict.documentIds[0],
                    target: conflict.documentIds[1],
                    unresolvedConflictCount: 0
                });
            }

            if (conflict.status === 'unresolved') {
                edgeMap.get(key)!.unresolvedConflictCount++;
            }
        });

        const calculatedEdges = Array.from(edgeMap.values());

        return { nodes: calculatedNodes, edges: calculatedEdges, nodeConflictCounts: calculatedNodeConflictCounts };
    }, [documents, conflicts]);

    const activeNodeIds = useMemo(() => {
        if (!hoveredNodeId) return null;
        const connectedIds = new Set<string>([hoveredNodeId]);
        edges.forEach(edge => {
            if (edge.source === hoveredNodeId) connectedIds.add(edge.target);
            if (edge.target === hoveredNodeId) connectedIds.add(edge.source);
        });
        return connectedIds;
    }, [hoveredNodeId, edges]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setPanStart({ x: e.clientX, y: e.clientY });
        setIsPanning(true);
    }, []);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isPanning) return;
        e.preventDefault();
        const dx = e.clientX - panStart.x;
        const dy = e.clientY - panStart.y;
        setTransform(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
        setPanStart({ x: e.clientX, y: e.clientY });
    }, [isPanning, panStart]);

    const handleMouseUpOrLeave = useCallback(() => {
        setIsPanning(false);
    }, []);

    // FIX: Specify the event target type as SVGSVGElement to correctly type e.currentTarget.
    const handleWheel = useCallback((e: React.WheelEvent<SVGSVGElement>) => {
        e.preventDefault();
        const scaleAmount = 1.1;
        const svg = e.currentTarget;
        const point = svg.createSVGPoint();
        point.x = e.clientX;
        point.y = e.clientY;
        // FIX: Added a null check for getScreenCTM() as it can be null.
        const ctm = svg.getScreenCTM();
        if (!ctm) {
            return;
        }
        const { x: mouseX, y: mouseY } = point.matrixTransform(ctm.inverse());
        
        const newScale = e.deltaY > 0 ? transform.k / scaleAmount : transform.k * scaleAmount;
        const clampedScale = Math.min(Math.max(0.2, newScale), 5);
        
        const newX = mouseX - (mouseX - transform.x) * (clampedScale / transform.k);
        const newY = mouseY - (mouseY - transform.y) * (clampedScale / transform.k);

        setTransform({ x: newX, y: newY, k: clampedScale });
    }, [transform]);

    const handleNodeMouseEnter = (node: Node) => {
        setHoveredNodeId(node.id);
        const conflictCount = nodeConflictCounts.get(node.id) || 0;
        setTooltip({
            contentLines: [node.label, `Total Conflicts: ${conflictCount}`],
            x: node.x,
            y: node.y,
        });
    };

    const handleNodeMouseLeave = () => {
        setHoveredNodeId(null);
        setTooltip(null);
    };
    
    if (documents.length === 0) {
        return (
             <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No Documents to Display</h3>
                <p className="text-gray-500 dark:text-gray-400 mt-2">Analyze some documents from the dashboard to see the graph view.</p>
            </div>
        );
    }

    const nodeMap = new Map(nodes.map(node => [node.id, node]));

    return (
        <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Document Conflict Graph</h1>
            <div 
                className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-center items-center overflow-hidden"
                style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
            >
                 <svg 
                    width="100%" 
                    height={height} 
                    viewBox={`0 0 ${width} ${height}`}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUpOrLeave}
                    onMouseLeave={handleMouseUpOrLeave}
                    onWheel={handleWheel}
                >
                    <g transform={`translate(${transform.x}, ${transform.y}) scale(${transform.k})`}>
                        {/* Edges */}
                        {edges.map(edge => {
                            const sourceNode = nodeMap.get(edge.source);
                            const targetNode = nodeMap.get(edge.target);
                            if (!sourceNode || !targetNode) return null;
                            
                            const isActive = activeNodeIds ? activeNodeIds.has(edge.source) && activeNodeIds.has(edge.target) : true;
                            const hasUnresolved = edge.unresolvedConflictCount > 0;

                            return (
                                <g 
                                    key={`${edge.source}-${edge.target}`}
                                    className="transition-opacity duration-300"
                                    style={{ opacity: hoveredNodeId && !isActive ? 0.2 : 1 }}
                                >
                                    <line
                                        x1={sourceNode.x}
                                        y1={sourceNode.y}
                                        x2={targetNode.x}
                                        y2={targetNode.y}
                                        stroke={hasUnresolved ? '#e53e3e' : '#38a169'}
                                        strokeWidth={Math.min(1 + edge.unresolvedConflictCount, 5) / transform.k}
                                    />
                                    {hasUnresolved && (
                                        <text
                                            x={(sourceNode.x + targetNode.x) / 2}
                                            y={(sourceNode.y + targetNode.y) / 2}
                                            fill="#fff"
                                            fontSize={12 / transform.k}
                                            textAnchor="middle"
                                            dy={-8 / transform.k}
                                            className="font-bold pointer-events-none"
                                        >
                                            {edge.unresolvedConflictCount}
                                        </text>
                                    )}
                                </g>
                            );
                        })}

                        {/* Nodes */}
                        {nodes.map(node => {
                            const isActive = activeNodeIds ? activeNodeIds.has(node.id) : true;
                            return (
                                <g 
                                    key={node.id}
                                    transform={`translate(${node.x},${node.y})`}
                                    onMouseEnter={() => handleNodeMouseEnter(node)}
                                    onMouseLeave={handleNodeMouseLeave}
                                    className="cursor-pointer transition-opacity duration-300"
                                    style={{ opacity: hoveredNodeId && !isActive ? 0.2 : 1 }}
                                >
                                    <circle r="40" fill="#4299e1" stroke="#fff" strokeWidth={3 / transform.k} />
                                    <text
                                        y="4"
                                        fill="white"
                                        fontSize="10"
                                        textAnchor="middle"
                                        style={{ pointerEvents: 'none', userSelect: 'none' }}
                                        className="font-semibold"
                                    >
                                        {node.label.length > 12 ? node.label.substring(0, 10) + '...' : node.label}
                                    </text>
                                </g>
                            );
                        })}

                        {/* Tooltip */}
                        {tooltip && <Tooltip tooltipData={{...tooltip, scale: transform.k}} />}
                    </g>
                </svg>
            </div>
             <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 flex justify-center items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center">
                    <div className="w-4 h-1 bg-highlight mr-2 rounded"></div>
                    <span>No Unresolved Conflicts</span>
                </div>
                <div className="flex items-center">
                    <div className="w-4 h-1 bg-danger mr-2 rounded"></div>
                    <span>Has Unresolved Conflicts</span>
                </div>
            </div>
        </div>
    );
};

export default DocumentGraphViewer;
