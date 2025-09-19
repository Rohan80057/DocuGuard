

import React from 'react';
import { Conflict, Resolution } from '../types';

interface ConflictResolutionModalProps {
    conflict: Conflict;
    onClose: () => void;
    onResolve: (conflictId: string, resolution: Resolution) => void;
}

const ExcerptCard: React.FC<{ title: string, content: string, onAccept: () => void }> = ({ title, content, onAccept }) => (
    <div className="flex flex-col bg-gray-100 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-600 h-full">
        <h4 className="text-lg font-semibold text-accent mb-2">{title}</h4>
        <p className="text-gray-600 dark:text-gray-400 flex-grow mb-4 whitespace-pre-wrap">"{content}"</p>
        <button 
            onClick={onAccept}
            className="mt-auto w-full bg-highlight hover:bg-green-700 text-white font-bold py-2 px-4 rounded transition-colors"
        >
            Accept This Version
        </button>
    </div>
);

const ConflictResolutionModal: React.FC<ConflictResolutionModalProps> = ({ conflict, onClose, onResolve }) => {

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-gray-200 dark:border-gray-700">
                <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Resolve Conflict</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                
                <div className="p-8 overflow-y-auto">
                    <div className="mb-6 bg-danger/10 p-4 rounded-lg">
                        <h3 className="font-semibold text-red-800 dark:text-red-300 mb-1">AI Explanation of Conflict:</h3>
                        <p className="text-red-700 dark:text-red-200">{conflict.explanation}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <ExcerptCard
                            title={conflict.documentTitles[0]}
                            content={conflict.excerpts[0]}
                            onAccept={() => onResolve(conflict.id, 'accept_doc1')}
                        />
                        <ExcerptCard
                            title={conflict.documentTitles[1]}
                            content={conflict.excerpts[1]}
                            onAccept={() => onResolve(conflict.id, 'accept_doc2')}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 rounded-b-2xl">
                    <div className="flex justify-end space-x-4">
                        <button
                            onClick={() => onResolve(conflict.id, 'ignore')}
                            className="px-6 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                        >
                            Ignore Conflict
                        </button>
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-accent hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                        >
                           Decide Later
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ConflictResolutionModal;
