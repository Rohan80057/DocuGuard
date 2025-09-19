import React, { useState, useEffect } from 'react';
import { Document, DocumentId } from '../types';

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    documents: Document[];
    onAnalyze: (targetId: DocumentId) => void;
    isAnalyzing: boolean;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, documents, onAnalyze, isAnalyzing }) => {
    const [selectedId, setSelectedId] = useState<DocumentId | ''>('');

    useEffect(() => {
        // Pre-select the first document if available when modal opens
        if (isOpen && documents.length > 0) {
            setSelectedId(documents[0].id);
        } else {
            setSelectedId('');
        }
    }, [isOpen, documents]);

    if (!isOpen) return null;

    const handleAnalyzeClick = () => {
        if (selectedId) {
            onAnalyze(selectedId);
        }
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-secondary rounded-2xl shadow-2xl w-full max-w-lg border border-gray-700">
                <div className="p-6 border-b border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-white">Select Document to Compare</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-8 max-h-[60vh] overflow-y-auto">
                    <p className="text-text-secondary mb-6">Choose a document to analyze for contradictions against the current one.</p>
                    <div className="space-y-3">
                        {documents.map(doc => (
                            <label 
                                key={doc.id} 
                                className={`flex items-center justify-between bg-primary p-4 rounded-lg cursor-pointer hover:bg-secondary/60 border-2 transition-all ${
                                    selectedId === doc.id ? 'border-accent bg-accent/10' : 'border-gray-700'
                                }`}
                                onClick={() => setSelectedId(doc.id)}
                            >
                                <span className="text-lg font-semibold text-text-primary">{doc.title}</span>
                                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${selectedId === doc.id ? 'border-accent bg-accent' : 'border-gray-500'}`}>
                                    {selectedId === doc.id && (
                                        <svg className="h-3.5 w-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                                        </svg>
                                    )}
                                </div>
                                <input
                                    type="radio"
                                    name="document-selection"
                                    value={doc.id}
                                    checked={selectedId === doc.id}
                                    onChange={() => setSelectedId(doc.id)}
                                    className="sr-only"
                                />
                            </label>
                        ))}
                    </div>
                </div>

                <div className="p-6 border-t border-gray-700 flex justify-end gap-4">
                    <button onClick={onClose} className="px-6 py-2 bg-gray-600 hover:bg-gray-500 text-white font-semibold rounded-lg transition-colors">
                        Cancel
                    </button>
                    <button
                        onClick={handleAnalyzeClick}
                        disabled={!selectedId || isAnalyzing}
                        className="px-6 py-2 bg-highlight hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors flex items-center justify-center"
                    >
                         {isAnalyzing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Analyzing...
                            </>
                        ) : 'Analyze'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AnalysisModal;