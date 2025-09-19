import React, { useState, useEffect, useRef } from 'react';
import { Document, DocumentId } from '../types';
import AnalysisModal from './AnalysisModal';

interface DocumentEditorProps {
    document: Document;
    allDocuments: Document[];
    onSave: (id: DocumentId, content: string) => void;
    onAnalyze: (doc1Id: DocumentId, doc2Id: DocumentId) => void;
    isAnalyzing: boolean;
    onSwitchDocument: (id: DocumentId) => void;
}

const ToolbarButton: React.FC<{ onClick: () => void; title: string; children: React.ReactNode }> = ({ onClick, title, children }) => (
    <button
        onClick={onClick}
        title={title}
        className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white rounded-md transition-colors"
    >
        {children}
    </button>
);

const DocumentEditor: React.FC<DocumentEditorProps> = ({ document, allDocuments, onSave, onAnalyze, isAnalyzing, onSwitchDocument }) => {
    const [history, setHistory] = useState<string[]>([document.content]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const content = history[historyIndex];
    const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        setHistory([document.content]);
        setHistoryIndex(0);
    }, [document]);

    const updateContent = (newText: string, selectionStart: number, selectionEnd: number) => {
        const newHistory = history.slice(0, historyIndex + 1);
        setHistory([...newHistory, newText]);
        setHistoryIndex(newHistory.length);

        setTimeout(() => {
            const textarea = textareaRef.current;
            if (textarea) {
                textarea.focus();
                textarea.setSelectionRange(selectionStart, selectionEnd);
            }
        }, 0);
    };
    
    const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        updateContent(e.target.value, e.target.selectionStart, e.target.selectionEnd);
    };

    const applyMarkdownFormatting = (prefix: string, suffix: string = prefix) => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        const newText = `${content.substring(0, start)}${prefix}${selectedText}${suffix}${content.substring(end)}`;
        
        updateContent(newText, start + prefix.length, end + prefix.length);
    };

    const applyListFormatting = () => {
        const textarea = textareaRef.current;
        if (!textarea) return;

        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end);
        
        const lines = selectedText.split('\n');
        const formattedLines = lines.map(line => `- ${line}`);
        const newSelectedText = formattedLines.join('\n');

        const newText = `${content.substring(0, start)}${newSelectedText}${content.substring(end)}`;
        updateContent(newText, start, start + newSelectedText.length);
    };
    
    const applyLinkFormatting = () => {
        const url = prompt("Enter the URL:");
        if (!url) return;
        
        const textarea = textareaRef.current;
        if (!textarea) return;
        
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selectedText = content.substring(start, end) || 'link text';
        
        const newText = `${content.substring(0, start)}[${selectedText}](${url})${content.substring(end)}`;
        updateContent(newText, start + 1, start + 1 + selectedText.length);
    };

    const handleUndo = () => historyIndex > 0 && setHistoryIndex(historyIndex - 1);
    const handleRedo = () => historyIndex < history.length - 1 && setHistoryIndex(historyIndex + 1);
    const handleSave = () => onSave(document.id, content);

    const handleStartAnalysis = (targetId: DocumentId) => {
        onAnalyze(document.id, targetId);
        setIsAnalysisModalOpen(false);
    };

    const otherDocuments = allDocuments.filter(d => d.id !== document.id);

    return (
        <>
            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 h-full flex flex-col">
                <div className="flex justify-between items-center mb-6 gap-4">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white truncate" title={document.title}>{document.title}</h1>
                    <div className="relative flex-shrink-0">
                         <select
                            value={document.id}
                            onChange={(e) => onSwitchDocument(e.target.value)}
                            className="bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md py-2 pl-3 pr-8 text-sm focus:ring-accent focus:border-accent appearance-none text-gray-800 dark:text-gray-200"
                        >
                            {allDocuments.map(doc => (
                                <option key={doc.id} value={doc.id}>
                                    {doc.title}
                                </option>
                            ))}
                        </select>
                         <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500 dark:text-gray-400">
                            <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-1 mb-4 p-2 bg-gray-100 dark:bg-gray-900 rounded-md border border-gray-200 dark:border-gray-600">
                     <ToolbarButton onClick={() => applyMarkdownFormatting('**')} title="Bold">
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"></path></svg>
                    </ToolbarButton>
                     <ToolbarButton onClick={() => applyMarkdownFormatting('*')} title="Italic">
                         <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"></line><line x1="14" y1="20" x2="5" y2="20"></line><line x1="15" y1="4" x2="9" y2="20"></line></svg>
                    </ToolbarButton>
                     <ToolbarButton onClick={applyListFormatting} title="Unordered List">
                         <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
                    </ToolbarButton>
                     <ToolbarButton onClick={applyLinkFormatting} title="Insert Link">
                         <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.72"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.72-1.72"></path></svg>
                    </ToolbarButton>
                </div>

                <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={handleContentChange}
                    className="w-full flex-grow bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-accent focus:border-accent resize-none text-gray-800 dark:text-gray-200"
                    placeholder="Start writing your document..."
                />

                <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                    <button
                        onClick={() => setIsAnalysisModalOpen(true)}
                        disabled={isAnalyzing || otherDocuments.length === 0}
                        className="px-6 py-2.5 bg-highlight hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors duration-200"
                    >
                        {otherDocuments.length > 0 ? 'Analyze Document' : 'No other documents to analyze'}
                    </button>
                    
                    <div className="flex items-center gap-2">
                         <button onClick={handleUndo} disabled={historyIndex <= 0} className="p-2.5 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-white font-bold rounded-lg transition-colors" title="Undo">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 15l-3-3m0 0l3-3m-3 3h8a5 5 0 010 10H6" /></svg>
                        </button>
                         <button onClick={handleRedo} disabled={historyIndex >= history.length - 1} className="p-2.5 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 disabled:opacity-50 disabled:cursor-not-allowed text-gray-800 dark:text-white font-bold rounded-lg transition-colors" title="Redo">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 15l3-3m0 0l-3-3m3 3H8a5 5 0 000 10h1" /></svg>
                        </button>
                        <button onClick={handleSave} className="px-6 py-2.5 bg-accent hover:bg-blue-700 text-white font-bold rounded-lg transition-colors duration-200">
                            Save Changes
                        </button>
                    </div>
                </div>
            </div>
            
            <AnalysisModal
                isOpen={isAnalysisModalOpen}
                onClose={() => setIsAnalysisModalOpen(false)}
                documents={otherDocuments}
                onAnalyze={handleStartAnalysis}
                isAnalyzing={isAnalyzing}
            />
        </>
    );
};

export default DocumentEditor;
