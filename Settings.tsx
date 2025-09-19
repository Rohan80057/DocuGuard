import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface SettingsProps {
    userProfile: UserProfile;
    onUpdateProfile: (newProfile: UserProfile) => void;
}

const Settings: React.FC<SettingsProps> = ({ userProfile, onUpdateProfile }) => {
    const [formData, setFormData] = useState<UserProfile>(userProfile);
    const [apiKey, setApiKey] = useState('');

    useEffect(() => {
        setFormData(userProfile);
    }, [userProfile]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleToggleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target;
        setFormData(prev => ({...prev, [name]: checked}));
    }

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdateProfile(formData);
    };
    
    return (
        <div className="space-y-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Settings</h1>

            <div className="bg-white dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700 max-w-2xl">
                <form onSubmit={handleSave}>
                    <div className="space-y-8">
                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Personal Information</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        id="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full bg-gray-100 dark:bg-gray-900 p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-accent focus:border-accent text-gray-800 dark:text-gray-200"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        name="email"
                                        id="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-gray-100 dark:bg-gray-900 p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-accent focus:border-accent text-gray-800 dark:text-gray-200"
                                        placeholder="your.email@example.com"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Phone Number</label>
                                    <input
                                        type="tel"
                                        name="phone"
                                        id="phone"
                                        value={formData.phone || ''}
                                        onChange={handleChange}
                                        className="w-full bg-gray-100 dark:bg-gray-900 p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-accent focus:border-accent text-gray-800 dark:text-gray-200"
                                        placeholder="+1 (555) 123-4567"
                                    />
                                </div>
                            </div>
                        </div>

                        <div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 border-t border-gray-200 dark:border-gray-700 pt-8">API Configuration</h2>
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="apiKey" className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Gemini API Key</label>
                                    <input
                                        type="password"
                                        name="apiKey"
                                        id="apiKey"
                                        value={apiKey}
                                        onChange={(e) => setApiKey(e.target.value)}
                                        className="w-full bg-gray-100 dark:bg-gray-900 p-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-accent focus:border-accent text-gray-800 dark:text-gray-200"
                                        placeholder="Enter temporary API key..."
                                    />
                                    <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                                        For security, it is strongly recommended to configure the API key via environment variables. Keys entered here are for temporary use and are not saved.
                                    </p>
                                </div>
                            </div>
                        </div>

                         <div>
                            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6 border-t border-gray-200 dark:border-gray-700 pt-8">Application Settings</h2>
                             <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 mb-2">Notification Preferences</h3>
                                    <div className="flex items-center justify-between bg-gray-100 dark:bg-gray-900 p-4 rounded-lg">
                                        <span className="text-gray-600 dark:text-gray-400">Enable all notifications</span>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                name="notificationsEnabled"
                                                className="sr-only peer" 
                                                checked={formData.notificationsEnabled}
                                                onChange={handleToggleChange}
                                            />
                                            <div className="w-11 h-6 bg-gray-300 dark:bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-accent"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
                        <button type="submit" className="px-6 py-2 bg-accent hover:bg-blue-700 text-white font-bold rounded-lg transition-colors">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Settings;
