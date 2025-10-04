import React, { useState, useEffect } from 'react';
import { Schedule, RotationPattern } from '../types';
import { getSchedules, deleteSchedule } from '../services/storageService';

interface SavedSchedulesModalProps {
    isOpen: boolean;
    onClose: () => void;
    onLoad: (startDate: string, pattern: RotationPattern) => void;
}

const SavedSchedulesModal: React.FC<SavedSchedulesModalProps> = ({ isOpen, onClose, onLoad }) => {
    const [schedules, setSchedules] = useState<Schedule[]>([]);
    const [isRendered, setIsRendered] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setSchedules(getSchedules());
            setIsRendered(true);
        } else {
            // Wait for animation to finish before unmounting
            const timer = setTimeout(() => setIsRendered(false), 300); 
            return () => clearTimeout(timer);
        }
    }, [isOpen]);


    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this schedule?')) {
            deleteSchedule(id);
            setSchedules(getSchedules());
        }
    };
    
    if (!isRendered) return null;

    return (
        <div 
            className={`modal-overlay fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center p-4 z-50 ${isOpen ? 'open' : ''}`} 
            role="dialog" 
            aria-modal="true" 
            aria-labelledby="saved-schedules-title"
            onClick={onClose}
        >
            <div 
                className="modal-content rounded-2xl p-6 w-full max-w-lg max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <h2 id="saved-schedules-title" className="text-2xl font-bold text-gray-50">Saved Schedules</h2>
                        <span className="flex items-center justify-center bg-gray-800/50 text-orange-400 text-sm font-bold w-7 h-7 rounded-full border-2 border-white/10 font-mono">
                            {schedules.length}
                        </span>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white" aria-label="Close">
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>
                <div className="modal-body flex-grow overflow-y-auto -mr-3 pr-3">
                    {schedules.length === 0 ? (
                        <div className="text-center text-gray-400 py-12">
                            <p className="text-lg">You have no saved schedules.</p>
                            <p className="text-sm">Create a schedule and save it to see it here.</p>
                        </div>
                    ) : (
                        <ul className="space-y-4">
                            {schedules.map(schedule => (
                                <li key={schedule.id} className="schedule-list-item rounded-xl p-5 flex flex-col gap-4">
                                    <div>
                                        <h3 className="text-xl font-bold text-gray-50">{schedule.name}</h3>
                                        <div className="flex flex-wrap items-center text-sm text-gray-400 gap-x-2 mt-1.5">
                                            <span className="font-semibold">{schedule.pattern}</span>
                                            <span>•</span>
                                            <span>Start: {new Date(schedule.startDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                            <span>•</span>
                                            <span>Saved: {new Date(schedule.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                        </div>
                                        {schedule.description && <p className="text-gray-300 italic text-sm mt-2">{schedule.description}</p>}
                                    </div>
                                    
                                    <div className="flex items-center gap-3 mt-1">
                                        <button 
                                            onClick={() => {
                                                onLoad(schedule.startDate, schedule.pattern);
                                                onClose();
                                            }}
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-white/20 text-gray-300 hover:bg-white/10 hover:border-white/30 transition duration-200 font-semibold text-sm"
                                            aria-label={`Load schedule ${schedule.name}`}
                                        >
                                            <span className="material-icons-outlined text-base">visibility</span>
                                            <span>Load</span>
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(schedule.id)} 
                                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-500/10 hover:border-red-500/70 transition duration-200 font-semibold text-sm"
                                            aria-label={`Delete schedule ${schedule.name}`}
                                        >
                                            <span className="material-icons-outlined text-base">delete_outline</span>
                                            <span>Delete</span>
                                        </button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SavedSchedulesModal;