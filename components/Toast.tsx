
import React, { useState, useEffect } from 'react';

interface ToastProps {
    message: string;
}

const Toast: React.FC<ToastProps> = ({ message }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (message) {
            setVisible(true);
            const timer = setTimeout(() => {
                setVisible(false);
            }, 2800); // A little shorter than the CSS transition
            return () => clearTimeout(timer);
        }
    }, [message]);

    return (
        <div 
            className={`fixed top-6 right-6 transition-all duration-400 ease-in-out z-[100]
            flex items-center gap-3 bg-gray-800/60 backdrop-blur-md border border-white/10 text-white font-semibold py-3 px-5 rounded-xl
            shadow-[0_8px_24px_rgba(249,115,22,0.1),_0_8px_24px_rgba(79,70,229,0.08)]
            ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[120%]'}`}
        >
            <span className="material-icons-outlined text-green-400">check_circle</span>
            <span>{message}</span>
        </div>
    );
};

export default Toast;