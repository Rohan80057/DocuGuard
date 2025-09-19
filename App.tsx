import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DocumentEditor from './components/DocumentEditor';
import ConflictInbox from './components/ConflictInbox';
import DocumentGraphViewer from './components/DocumentGraphViewer';
import History from './components/History';
import Settings from './components/Settings';
import Notification from './components/Notification';
import { Document, Conflict, HistoryEvent, DocumentId, Resolution, UserProfile } from './types';
import { initialDocuments, initialConflicts } from './constants';
import { findConflictsBetweenDocuments } from './services/geminiService';

type View = 'dashboard' | 'editor' | 'inbox' | 'graph' | 'history' | 'settings';

const LOCAL_STORAGE_KEY = 'docuGuardState';

// Enhanced localStorage utility with better error handling
const safeLocalStorage = {
    isSupported: (() => {
        try {
            const testKey = '__localStorage_test__';
            localStorage.setItem(testKey, 'test');
            localStorage.removeItem(testKey);
            return true;
        } catch {
            return false;
        }
    })(),
    
    getItem: (key: string) => {
        if (!safeLocalStorage.isSupported) return null;
        try {
            return localStorage.getItem(key);
        } catch (error) {
            console.error('Error reading from localStorage:', error);
            return null;
        }
    },
    
    setItem: (key: string, value: string) => {
        if (!safeLocalStorage.isSupported) return false;
        try {
            localStorage.setItem(key, value);
            return true;
        } catch (error) {
            console.error('Error writing to localStorage:', error);
            return false;
        }
    },
    
    removeItem: (key: string) => {
        if (!safeLocalStorage.isSupported) return;
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Error removing from localStorage:', error);
        }
    }
};

const loadState = () => {
    try {
        const serializedState = safeLocalStorage.getItem(LOCAL_STORAGE_KEY);
        if (serializedState === null) {
            return undefined;
        }
        const parsed = JSON.parse(serializedState);

        if (typeof parsed !== 'object' || parsed === null) {
            throw new Error("Loaded state is not a valid object.");
        }

        return {
            documents: Array.isArray(parsed.documents) ? parsed.documents : undefined,
            conflicts: Array.isArray(parsed.conflicts) ? parsed.conflicts : undefined,
            history: Array.isArray(parsed.history) ? parsed.history : undefined,
            userProfile: (typeof parsed.userProfile === 'object' && parsed.userProfile !== null) ? parsed.userProfile : undefined,
            reportsGeneratedCount: typeof parsed.reportsGeneratedCount === 'number' ? parsed.reportsGeneratedCount : undefined,
        };
    } catch (err) {
        console.error("Could not load state, clearing potentially corrupted data.", err);
        safeLocalStorage.removeItem(LOCAL_STORAGE_KEY);
        return undefined;
    }
};

function App() {
    const savedState = useMemo(() => loadState(), []);

    const [documents, setDocuments] = useState<Document[]>(savedState?.documents || initialDocuments);
    const [conflicts, setConflicts] = useState<Conflict[]>(savedState?.conflicts || initialConflicts);
    const [history, setHistory] = useState<HistoryEvent[]>(savedState?.history || []);
    const [userProfile, setUserProfile] = useState<UserProfile>(
        savedState?.userProfile || { 
            name: 'Guest User', 
            email: '', 
            phone: '', 
            notificationsEnabled: true, 
            theme: 'dark' 
        }
    );
    const [reportsGeneratedCount, setReportsGeneratedCount] = useState<number>(savedState?.reportsGeneratedCount || 0);

    const [activeView, setActiveView] = useState<View>('dashboard');
    const [activeDocumentId, setActiveDocumentId] = useState<DocumentId | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [notification, setNotification] = useState<{ message: string, type: 'success' | 'error' } | null>(null);
    
    // Memoized state to save
    const stateToSave = useMemo(() => ({
        documents,
        conflicts,
        history,
        userProfile,
        reportsGeneratedCount
    }), [documents, conflicts, history, userProfile, reportsGeneratedCount]);

    // Enhanced localStorage persistence with proper error handling
    useEffect(() => {
        const saveState = () => {
            try {
                const serializedState = JSON.stringify(stateToSave);
                const success = safeLocalStorage.setItem(LOCAL_STORAGE_KEY, serializedState);
                if (!success && safeLocalStorage.isSupported) {
                    console.warn('Failed to save state to localStorage');
                }
            } catch (err) {
                console.error("Could not serialize and save state:", err);
            }
        };

        // Debounce the save operation
        const timeoutId = setTimeout(saveState, 300);
        return () => clearTimeout(timeoutId);
    }, [stateToSave]);

    // Theme effect with proper cleanup
    useEffect(() => {
        const applyTheme = () => {
            if (userProfile.theme === 'dark') {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        };

        applyTheme();
    }, [userProfile.theme]);

    // Document management effect
    useEffect(() => {
        if (documents.length > 0 && (!activeDocumentId || !documents.find(d => d.id === activeDocumentId))) {
            setActiveDocumentId(documents[0].id);
        } else if (documents.length === 0) {
            setActiveDocumentId(null);
            if (activeView === 'editor') {
                setActiveView('dashboard');
            }
        }
    }, [documents, activeDocumentId, activeView]);

    // Memoized callback functions to prevent unnecessary re-renders
    const addHistoryEvent = useCallback((type: HistoryEvent['type'], details: string) => {
        const newEvent: HistoryEvent = {
            id: crypto.randomUUID(),
            type,
            details,
            timestamp: new Date().toISOString(),
        };
        setHistory(prev => [newEvent, ...prev]);
    }, []);
    
    const showNotification = useCallback((message: string, type: 'success' | 'error') => {
        if (userProfile.notificationsEnabled) {
            setNotification({ message, type });
        }
    }, [userProfile.notificationsEnabled]);

    const handleStartAnalysis = useCallback(async (files: File[]) => {
        if (files.length < 2) {
            showNotification('Please select at least two files to analyze.', 'error');
            return;
        }
        setIsAnalyzing(true);
        showNotification('Analysis started. Reading files...', 'success');
        addHistoryEvent('analysis_started', `Started analysis on ${files.length} documents.`);

        try {
            const textFiles = files.filter(file => file.type === 'text/plain');
            
            if (textFiles.length < files.length) {
                showNotification('Some files were not .txt and were ignored.', 'error');
            }

            if (textFiles.length < 2) {
                showNotification('At least two .txt files are required for analysis.', 'error');
                return;
            }

            const newDocuments: Document[] = await Promise.all(
                textFiles.map(async (file) => ({
                    id: crypto.randomUUID(),
                    title: file.name,
                    content: await file.text(),
                }))
            );
            
            setDocuments(prev => [...prev, ...newDocuments]);
            showNotification('Documents loaded. Now finding conflicts...', 'success');

            // Generate pairs for analysis
            const pairsToAnalyze: [Document, Document][] = [];
            newDocuments.forEach(newDoc => {
                documents.forEach(oldDoc => pairsToAnalyze.push([newDoc, oldDoc]));
            });
            for (let i = 0; i < newDocuments.length; i++) {
                for (let j = i + 1; j < newDocuments.length; j++) {
                    pairsToAnalyze.push([newDocuments[i], newDocuments[j]]);
                }
            }
            
            const foundFromApi = (await Promise.all(
                pairsToAnalyze.map(([docA, docB]) => findConflictsBetweenDocuments(docA, docB))
            )).flat();

            const formattedConflicts: Conflict[] = foundFromApi.map(c => ({
                ...c,
                id: crypto.randomUUID(),
                status: 'unresolved',
                resolution: null,
            }));

            setConflicts(prev => {
                const others = prev.filter(oldConflict => 
                    !pairsToAnalyze.some(pair => 
                        oldConflict.documentIds.includes(pair[0].id) && oldConflict.documentIds.includes(pair[1].id)
                    )
                );
                return [...others, ...formattedConflicts];
            });

            addHistoryEvent('analysis_complete', `Analysis complete. Found ${formattedConflicts.length} new conflicts.`);
            showNotification(`Analysis complete! Found ${formattedConflicts.length} new potential conflicts.`, 'success');
            setActiveView('inbox');
        } catch (error) {
            console.error("Analysis failed:", error);
            showNotification('An error occurred during analysis. Please check the console.', 'error');
            addHistoryEvent('analysis_error', 'Analysis failed due to an error.');
        } finally {
            setIsAnalyzing(false);
        }
    }, [documents, addHistoryEvent, showNotification]);
    
    const handleAnalyzePair = useCallback(async (doc1Id: DocumentId, doc2Id: DocumentId) => {
        setIsAnalyzing(true);
        showNotification('Starting analysis between two documents...', 'success');
        
        const doc1 = documents.find(d => d.id === doc1Id);
        const doc2 = documents.find(d => d.id === doc2Id);

        if (!doc1 || !doc2) {
            showNotification('Could not find documents to analyze.', 'error');
            setIsAnalyzing(false);
            return;
        }

        addHistoryEvent('analysis_started', `Analyzing "${doc1.title}" and "${doc2.title}".`);
        
        try {
            const foundConflicts = await findConflictsBetweenDocuments(doc1, doc2);
            const newConflicts: Conflict[] = foundConflicts.map(c => ({
                ...c,
                id: crypto.randomUUID(),
                status: 'unresolved',
                resolution: null,
            }));

            setConflicts(prev => {
                const others = prev.filter(c => {
                    const [id1, id2] = c.documentIds;
                    return !((id1 === doc1Id && id2 === doc2Id) || (id1 === doc2Id && id2 === doc1Id));
                });
                return [...others, ...newConflicts];
            });

            addHistoryEvent('analysis_complete', `Found ${newConflicts.length} new conflicts between "${doc1.title}" and "${doc2.title}".`);
            showNotification(`Analysis complete! Found ${newConflicts.length} new conflicts.`, 'success');
            setActiveView('inbox');
        } catch (error) {
            console.error("Pair analysis failed:", error);
            showNotification('An error occurred during analysis.', 'error');
            addHistoryEvent('analysis_error', `Analysis failed between "${doc1.title}" and "${doc2.title}".`);
        } finally {
            setIsAnalyzing(false);
        }
    }, [documents, addHistoryEvent, showNotification]);

    const handleSaveDocument = useCallback((id: DocumentId, content: string) => {
        setDocuments(docs => docs.map(doc => doc.id === id ? { ...doc, content } : doc));
        showNotification('Document saved successfully!', 'success');
        addHistoryEvent('document_saved', `Document with ID ${id} was saved.`);
    }, [showNotification, addHistoryEvent]);

    const handleResolveConflict = useCallback((conflictId: string, resolution: Resolution) => {
        setConflicts(prev => prev.map(c => 
            c.id === conflictId ? { 
                ...c, 
                status: resolution === 'ignore' ? 'ignored' : 'resolved', 
                resolution 
            } : c
        ));
        
        const conflict = conflicts.find(c => c.id === conflictId);
        if (conflict) {
            addHistoryEvent('conflict_resolved', `Conflict between "${conflict.documentTitles[0]}" and "${conflict.documentTitles[1]}" was resolved.`);
        }
        showNotification('Conflict status updated.', 'success');
    }, [conflicts, addHistoryEvent, showNotification]);
    
    const handleUpdateProfile = useCallback((newProfile: UserProfile) => {
        setUserProfile(newProfile);
        showNotification('Profile updated successfully!', 'success');
        addHistoryEvent('profile_updated', 'User profile was updated.');
    }, [showNotification, addHistoryEvent]);

    const handleToggleTheme = useCallback(() => {
        setUserProfile(prev => ({
            ...prev,
            theme: prev.theme === 'dark' ? 'light' : 'dark'
        }));
    }, []);

    const handleGenerateReport = useCallback(() => {
        setReportsGeneratedCount(prev => prev + 1);
        addHistoryEvent('report_generated', 'Generated and downloaded a conflict report.');
    }, [addHistoryEvent]);

    // Memoized computed values
    const activeDocument = useMemo(() => 
        documents.find(d => d.id === activeDocumentId), 
        [documents, activeDocumentId]
    );
    
    const unresolvedConflictsCount = useMemo(() => 
        conflicts.filter(c => c.status === 'unresolved').length, 
        [conflicts]
    );

    // Memoized navigation handler
    const navigateToConflicts = useCallback(() => setActiveView('inbox'), []);

    const renderView = useCallback(() => {
        switch (activeView) {
            case 'dashboard':
                return <Dashboard
                    onStartAnalysis={handleStartAnalysis}
                    isAnalyzing={isAnalyzing}
                    docsProcessedCount={documents.length}
                    reportsGeneratedCount={reportsGeneratedCount}
                    unresolvedConflictsCount={unresolvedConflictsCount}
                    onNavigateToConflicts={navigateToConflicts}
                />;
            case 'editor':
                return activeDocument ? (
                    <DocumentEditor
                        document={activeDocument}
                        allDocuments={documents}
                        onSave={handleSaveDocument}
                        onAnalyze={handleAnalyzePair}
                        isAnalyzing={isAnalyzing}
                        onSwitchDocument={setActiveDocumentId}
                    />
                ) : (
                    <div className="text-center text-gray-500 mt-10">
                        No documents loaded. Please add documents from the Dashboard.
                    </div>
                );
            case 'inbox':
                return <ConflictInbox 
                    conflicts={conflicts} 
                    onResolve={handleResolveConflict} 
                    onGenerateReport={handleGenerateReport} 
                />;
            case 'graph':
                return <DocumentGraphViewer documents={documents} conflicts={conflicts} />;
            case 'history':
                return <History events={history} />;
            case 'settings':
                return <Settings userProfile={userProfile} onUpdateProfile={handleUpdateProfile} />;
            default:
                return <div>Dashboard</div>;
        }
    }, [activeView, handleStartAnalysis, isAnalyzing, documents.length, reportsGeneratedCount, 
        unresolvedConflictsCount, navigateToConflicts, activeDocument, documents, handleSaveDocument, 
        handleAnalyzePair, conflicts, handleResolveConflict, handleGenerateReport, history, 
        userProfile, handleUpdateProfile]);

    const handleCloseNotification = useCallback(() => setNotification(null), []);

    return (
        <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 font-sans">
            <Sidebar 
                activeView={activeView} 
                setActiveView={setActiveView} 
                hasDocuments={documents.length > 0} 
                theme={userProfile.theme}
                onToggleTheme={handleToggleTheme}
            />
            <main key={activeView} className="flex-1 p-8 animate-fadeIn">
                {renderView()}
            </main>
            {notification && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={handleCloseNotification}
                />
            )}
        </div>
    );
}

export default App;
