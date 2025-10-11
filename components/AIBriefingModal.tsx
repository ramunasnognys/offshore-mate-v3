import React, { useState, useEffect } from 'react';
import { ScheduleConfig } from '../types';
import { getRotationStatus } from '../services/scheduleService';
import { getDailyBriefing } from '../services/geminiService';

interface AIBriefingModalProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date | null;
    scheduleConfig: ScheduleConfig | null;
}

const AIBriefingModal: React.FC<AIBriefingModalProps> = ({ isOpen, onClose, date, scheduleConfig }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [briefingContent, setBriefingContent] = useState('');
    const [isRendered, setIsRendered] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
        } else {
            const timer = setTimeout(() => setIsRendered(false), 300); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && date && scheduleConfig) {
            const fetchBriefing = async () => {
                setIsLoading(true);
                setBriefingContent('');
                const rotationStartDate = new Date(scheduleConfig.startDate + 'T00:00:00');
                const { status, isFirstDay, isLastDay } = getRotationStatus(date, rotationStartDate, scheduleConfig.pattern);

                if (status) {
                    const content = await getDailyBriefing(date, status, isFirstDay, isLastDay);
                    setBriefingContent(content);
                } else {
                    setBriefingContent("No rotation data for this date.");
                }
                setIsLoading(false);
            };
            fetchBriefing();
        }
    }, [isOpen, date, scheduleConfig]);

    if (!isRendered) return null;

    const formattedDate = date ? new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).format(date) : '';
    const rotationStatus = date && scheduleConfig ? getRotationStatus(date, new Date(scheduleConfig.startDate + 'T00:00:00'), scheduleConfig.pattern).status : null;
    const icon = rotationStatus === 'offshore' ? 'waves' : rotationStatus === 'travel' ? 'flight_takeoff' : 'home';
    const color = rotationStatus === 'offshore' ? 'text-orange-400' : rotationStatus === 'travel' ? 'text-travel' : 'text-gray-300';
    
    return (
         <div 
            className={`modal-overlay fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center p-4 z-50 ${isOpen ? 'open' : ''}`}
            onClick={onClose}
        >
            <div 
                className="modal-content rounded-2xl p-6 w-full max-w-md max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-3">
                        <span className={`material-icons-outlined ${color}`}>{icon}</span>
                        <h2 className="text-xl font-title text-gray-50">{formattedDate}</h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>
                <div className="gemini-content max-h-[60vh] overflow-y-auto pr-2 flex-grow">
                    {isLoading && (
                        <div className="flex justify-center items-center p-8">
                            <div className="loader-small"></div>
                        </div>
                    )}
                    {!isLoading && <div dangerouslySetInnerHTML={{ __html: briefingContent }} />}
                </div>
            </div>
        </div>
    );
};

export default AIBriefingModal;