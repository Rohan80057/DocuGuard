
import React, { useState, useCallback } from 'react';

interface DashboardProps {
    onStartAnalysis: (files: File[]) => void;
    isAnalyzing: boolean;
    docsProcessedCount: number;
    reportsGeneratedCount: number;
    unresolvedConflictsCount: number;
    onNavigateToConflicts: () => void;
}

const StatCard: React.FC<{ title: string; value: string | number; onClick?: () => void; icon: JSX.Element }> = ({ title, value, onClick, icon }) => (
    <div
        className={`bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-accent transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`}
        onClick={onClick}
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 uppercase">{title}</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
            </div>
            <div className="bg-accent/20 text-accent p-3 rounded-lg">
                {icon}
            </div>
        </div>
    </div>
);

const FileUpload: React.FC<{ onFilesSelected: (files: File[]) => void; isAnalyzing: boolean }> = ({ onFilesSelected, isAnalyzing }) => {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const handleFileChange = (selectedFiles: FileList | null) => {
        if (selectedFiles) {
            const newFiles = Array.from(selectedFiles);
            setFiles(prev => [...prev, ...newFiles]);
        }
    };

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        setIsDragging(false);
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            handleFileChange(event.dataTransfer.files);
        }
    }, []);
    
    const handleDragEvents = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        if (event.type === "dragenter" || event.type === "dragover") {
            setIsDragging(true);
        } else if (event.type === "dragleave") {
            setIsDragging(false);
        }
    };

    const removeFile = (fileName: string) => {
        setFiles(files.filter(f => f.name !== fileName));
    };
    
    return (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Start New Analysis</h2>
            
            <div
                onDrop={handleDrop}
                onDragEnter={handleDragEvents}
                onDragOver={handleDragEvents}
                onDragLeave={handleDragEvents}
                className={`flex justify-center items-center w-full border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${isDragging ? 'border-accent bg-accent/10' : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'}`}
                onClick={() => document.getElementById('file-input')?.click()}
            >
                <input
                    type="file"
                    id="file-input"
                    multiple
                    accept=".txt,.pdf,.docx"
                    className="hidden"
                    onChange={(e) => handleFileChange(e.target.files)}
                />
                <div className="flex flex-col items-center">
                    <svg className="w-10 h-10 mb-3 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                    <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">TXT, PDF, or DOCX</p>
                    <p className="text-xs text-yellow-500 dark:text-yellow-400 mt-2">Note: Currently, only .txt files are processed.</p>
                </div>
            </div>

            {files.length > 0 && (
                <div className="mt-4 space-y-2">
                    {files.map(file => (
                        <div key={file.name} className="flex justify-between items-center bg-gray-100 dark:bg-gray-900/50 p-2 rounded-md text-sm">
                            <span className="text-gray-800 dark:text-gray-200 truncate">{file.name}</span>
                            <button onClick={() => removeFile(file.name)} className="text-danger hover:text-red-400">&times;</button>
                        </div>
                    ))}
                </div>
            )}

            <button
                onClick={() => onFilesSelected(files)}
                disabled={isAnalyzing || files.length < 2}
                className="mt-6 w-full px-6 py-3 bg-highlight hover:bg-green-700 disabled:bg-gray-500 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors duration-200 flex items-center justify-center"
            >
                {isAnalyzing ? (
                    <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Analyzing...
                    </>
                ) : `Analyze ${files.length} Documents`}
            </button>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ onStartAnalysis, isAnalyzing, docsProcessedCount, reportsGeneratedCount, unresolvedConflictsCount, onNavigateToConflicts }) => {
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Documents Processed" 
                    value={docsProcessedCount} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>}
                />
                <StatCard 
                    title="Unresolved Conflicts" 
                    value={unresolvedConflictsCount} 
                    onClick={onNavigateToConflicts}
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>}
                />
                <StatCard 
                    title="Reports Generated" 
                    value={reportsGeneratedCount} 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>}
                />
            </div>
            
            <FileUpload onFilesSelected={onStartAnalysis} isAnalyzing={isAnalyzing} />
        </div>
    );
};

export default Dashboard;
