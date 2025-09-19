import React from 'react';

type View = 'dashboard' | 'editor' | 'inbox' | 'graph' | 'history' | 'settings';

interface NavItemProps {
    label: string;
    view: View;
    activeView: View;
    onClick: (view: View) => void;
    icon: JSX.Element;
    disabled?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ label, view, activeView, onClick, icon, disabled = false }) => {
    const isActive = activeView === view;
    return (
        <button
            onClick={() => onClick(view)}
            disabled={disabled}
            className={`flex items-center w-full px-4 py-3 text-left rounded-lg transition-colors duration-200 ${
                isActive
                    ? 'bg-accent text-white font-semibold'
                    : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
            } ${
                disabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
        >
            <span className="mr-3">{icon}</span>
            {label}
        </button>
    );
};

interface SidebarProps {
    activeView: View;
    setActiveView: (view: View) => void;
    hasDocuments: boolean;
    theme: 'light' | 'dark';
    onToggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, setActiveView, hasDocuments, theme, onToggleTheme }) => {
    const icons = {
        dashboard: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>,
        editor: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>,
        inbox: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0l-8 5-8-5" /></svg>,
        graph: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.368a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" /></svg>,
        history: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        settings: <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924-1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>,
    };

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 p-6 flex flex-col justify-between border-r border-gray-200 dark:border-gray-700">
            <div>
                <div className="flex items-center mb-10">
                    <div className="bg-accent p-2 rounded-lg mr-3">
                        {/* DocuGuard Logo SVG */}
                        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M9 4H15C16.1046 4 17 4.89543 17 6V18C17 19.1046 16.1046 20 15 20H9C7.89543 20 7 19.1046 7 18V6C7 4.89543 7.89543 4 9 4Z" stroke="currentColor" strokeWidth="2"/>
                            <path d="M10 8L14 12L10 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">DocuGuard</h1>
                </div>

                <nav className="space-y-2">
                    <NavItem label="Dashboard" view="dashboard" activeView={activeView} onClick={setActiveView} icon={icons.dashboard} />
                    <NavItem label="Editor" view="editor" activeView={activeView} onClick={setActiveView} icon={icons.editor} disabled={!hasDocuments} />
                    <NavItem label="Conflicts" view="inbox" activeView={activeView} onClick={setActiveView} icon={icons.inbox} />
                    <NavItem label="Graph View" view="graph" activeView={activeView} onClick={setActiveView} icon={icons.graph} />
                    <NavItem label="History" view="history" activeView={activeView} onClick={setActiveView} icon={icons.history} />
                </nav>
            </div>

            <div>
                 <NavItem label="Settings" view="settings" activeView={activeView} onClick={setActiveView} icon={icons.settings} />
                 <button 
                    onClick={onToggleTheme}
                    className="flex items-center w-full px-4 py-3 mt-2 text-left rounded-lg transition-colors duration-200 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
                 >
                     {theme === 'dark' ? (
                        <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        Light Mode
                        </>
                     ) : (
                        <>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        Dark Mode
                        </>
                     )}
                 </button>
            </div>
        </aside>
    );
};

export default Sidebar;
