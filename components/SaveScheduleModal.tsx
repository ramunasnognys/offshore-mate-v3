import React, { useState, useEffect } from 'react';

interface SaveScheduleModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (name: string, description?: string) => void;
}

const SaveScheduleModal: React.FC<SaveScheduleModalProps> = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isRendered, setIsRendered] = useState(isOpen);

    useEffect(() => {
        if (isOpen) {
            setIsRendered(true);
        } else {
            const timer = setTimeout(() => {
                setIsRendered(false);
                // Reset fields when modal is fully closed
                setName('');
                setDescription('');
            }, 300); // Animation duration
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const handleSaveClick = () => {
        if (!name.trim()) {
            alert('Please enter a name for the schedule.');
            return;
        }
        onSave(name, description);
    };

    if (!isRendered) return null;

    return (
        <div 
            className={`modal-overlay fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center p-4 z-50 ${isOpen ? 'open' : ''}`}
            onClick={onClose}
        >
            <div 
                className="modal-content rounded-2xl p-6 w-full max-w-md flex flex-col gap-4"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center">
                    <h2 className="text-xl font-title text-gray-50">Save Schedule</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <span className="material-icons-outlined">close</span>
                    </button>
                </div>
                <div>
                    <label htmlFor="schedule-name" className="block text-sm font-medium text-gray-300 mb-2">Schedule Name (Required)</label>
                    <input
                        type="text"
                        id="schedule-name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full py-2 px-3 rounded-lg bg-black/30 border border-white/20 text-gray-200 focus:ring-orange-500 focus:border-orange-500 transition backdrop-blur-sm"
                        placeholder="e.g., North Sea Platform A"
                    />
                </div>
                <div>
                    <label htmlFor="schedule-desc" className="block text-sm font-medium text-gray-300 mb-2">Description (Optional)</label>
                    <textarea
                        id="schedule-desc"
                        rows={3}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full py-2 px-3 rounded-lg bg-black/30 border border-white/20 text-gray-200 focus:ring-orange-500 focus:border-orange-500 transition backdrop-blur-sm"
                        placeholder="Add any notes here..."
                    ></textarea>
                </div>
                <div className="flex justify-end items-center gap-4 mt-2">
                    <button onClick={onClose} className="text-gray-300 font-semibold hover:text-white transition px-4 py-2 rounded-full hover:bg-white/10">Cancel</button>
                    <button onClick={handleSaveClick} className="text-white font-title py-2 px-6 rounded-full accent-button">Save</button>
                </div>
            </div>
        </div>
    );
};

export default SaveScheduleModal;