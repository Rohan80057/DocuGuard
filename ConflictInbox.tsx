import React, { useState, useMemo } from 'react';
import { Conflict, Resolution } from '../types';
import ConflictResolutionModal from './ConflictResolutionModal';

interface ConflictInboxProps {
    conflicts: Conflict[];
    onResolve: (conflictId: string, resolution: Resolution) => void;
    onGenerateReport: () => void;
}

const severityClasses = {
    High: 'bg-danger text-white',
    Medium: 'bg-yellow-500 text-black',
    Low: 'bg-blue-500 text-white',
};

const statusClasses = {
    unresolved: 'bg-gray-500 text-white',
    resolved: 'bg-green-600 text-white',
    ignored: 'bg-purple-500 text-white',
};


const ConflictInbox: React.FC<ConflictInboxProps> = ({ conflicts, onResolve, onGenerateReport }) => {
    const [filterSeverity, setFilterSeverity] = useState('All');
    const [filterStatus, setFilterStatus] = useState('unresolved');
    const [sortOrder, setSortOrder] = useState('severity-desc');
    const [selectedConflict, setSelectedConflict] = useState<Conflict | null>(null);

    const filteredAndSortedConflicts = useMemo(() => {
        const severityOrder = { High: 3, Medium: 2, Low: 1 };
        return conflicts
            .filter(c => filterSeverity === 'All' || c.severity === filterSeverity)
            .filter(c => filterStatus === 'All' || c.status === filterStatus)
            .sort((a, b) => {
                if (sortOrder === 'severity-desc') {
                    return severityOrder[b.severity] - severityOrder[a.severity];
                }
                if (sortOrder === 'severity-asc') {
                    return severityOrder[a.severity] - severityOrder[b.severity];
                }
                return 0;
            });
    }, [conflicts, filterSeverity, filterStatus, sortOrder]);

    const handleResolve = (conflictId: string, resolution: Resolution) => {
        onResolve(conflictId, resolution);
        setSelectedConflict(null);
    };

    const handleExport = () => {
        onGenerateReport();
        const reportTitle = `DocuGuard Conflict Report - ${new Date().toLocaleString()}\n`;
        const filtersUsed = `Filters: Status='${filterStatus}', Severity='${filterSeverity}'\n\n`;
        
        const reportContent = filteredAndSortedConflicts.map(c => {
            return `
==================================================
Conflict between: ${c.documentTitles[0]} vs. ${c.documentTitles[1]}
--------------------------------------------------
- Severity: ${c.severity}
- Status: ${c.status}
- Explanation: ${c.explanation}

- Excerpt from "${c.documentTitles[0]}":
  "${c.excerpts[0]}"

- Excerpt from "${c.documentTitles[1]}":
  "${c.excerpts[1]}"
==================================================
            `.trim();
        }).join('\n\n');

        const fullReport = reportTitle + filtersUsed + reportContent;
        const blob = new Blob([fullReport], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `DocuGuard_Report_${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };


    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                 <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Conflict Inbox</h1>
                 <button 
                    onClick={handleExport}
                    disabled={filteredAndSortedConflicts.length === 0}
                    className="flex items-center gap-2 px-4 py-2 bg-highlight hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                    Export Report
                </button>
            </div>
            
            <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                 {/* Filter and Sort controls */}
                <div className="flex items-center gap-2">
                    <label htmlFor="status-filter" className="text-sm font-medium text-gray-600 dark:text-gray-400">Status:</label>
                    <select id="status-filter" value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-accent focus:border-accent">
                        <option value="All">All</option>
                        <option value="unresolved">Unresolved</option>
                        <option value="resolved">Resolved</option>
                        <option value="ignored">Ignored</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                     <label htmlFor="severity-filter" className="text-sm font-medium text-gray-600 dark:text-gray-400">Severity:</label>
                    <select id="severity-filter" value={filterSeverity} onChange={e => setFilterSeverity(e.target.value)} className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-accent focus:border-accent">
                        <option value="All">All</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                    </select>
                </div>
                 <div className="flex items-center gap-2">
                     <label htmlFor="sort-order" className="text-sm font-medium text-gray-600 dark:text-gray-400">Sort by:</label>
                    <select id="sort-order" value={sortOrder} onChange={e => setSortOrder(e.target.value)} className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md p-2 text-sm focus:ring-accent focus:border-accent">
                        <option value="severity-desc">Severity (High to Low)</option>
                        <option value="severity-asc">Severity (Low to High)</option>
                    </select>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    {filteredAndSortedConflicts.length > 0 ? (
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-900/50">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Severity</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Documents</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Explanation</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Resolve</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {filteredAndSortedConflicts.map(conflict => (
                                    <tr key={conflict.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${severityClasses[conflict.severity]}`}>{conflict.severity}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-200">{conflict.documentTitles.join(' vs. ')}</td>
                                        <td className="px-6 py-4 max-w-sm">
                                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{conflict.explanation}</p>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                             <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusClasses[conflict.status]}`}>{conflict.status}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button onClick={() => setSelectedConflict(conflict)} className="text-accent hover:text-blue-400">
                                                Resolve
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                         <div className="text-center py-16">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white">No Conflicts Found</h3>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Your inbox is clear! Or, try adjusting your filters.</p>
                        </div>
                    )}
                </div>
            </div>

            {selectedConflict && (
                <ConflictResolutionModal
                    conflict={selectedConflict}
                    onClose={() => setSelectedConflict(null)}
                    onResolve={handleResolve}
                />
            )}
        </div>
    );
};

export default ConflictInbox;
