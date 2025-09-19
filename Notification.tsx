import React, { useEffect, useState } from 'react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error';
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 300); // Call onClose after fade out animation
            }, 4700);
            
            return () => clearTimeout(timer);
        }
    }, [message, type, onClose]);

    const baseClasses = "fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white max-w-sm z-50 transition-all duration-300 transform border";
    const typeClasses = {
        success: 'bg-green-600 border-green-700',
        error: 'bg-red-600 border-red-700',
    };
    const visibilityClasses = visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5';

    if (!message) return null;

    return (
        <div className={`${baseClasses} ${typeClasses[type]} ${visibilityClasses}`}>
            <div className="flex items-center justify-between">
                <p className="font-semibold mr-4">{message}</p>
                <button onClick={() => {
                    setVisible(false);
                    setTimeout(onClose, 300);
                }} className="text-white hover:text-gray-200 text-2xl leading-none font-bold">
                     &times;
                </button>
            </div>
        </div>
    );
};

export default Notification;
