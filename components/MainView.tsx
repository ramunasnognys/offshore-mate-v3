import React, { useState, useEffect } from 'react';
import { RotationPattern } from '../types';
import SavedSchedulesModal from './SavedSchedulesModal';
import { getSchedules } from '../services/storageService';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { ClockIcon } from './icons/ClockIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';

interface MainViewProps {
    onGenerate: (startDate: string, pattern: RotationPattern) => void;
}

const PRESET_PATTERNS: RotationPattern[] = ['14/14', '14/21', '28/28'];

const MainView: React.FC<MainViewProps> = ({ onGenerate }) => {
    const today = new Date().toISOString().split('T')[0];
    const [startDate, setStartDate] = useState(today);
    const [pattern, setPattern] = useState<RotationPattern>('14/14');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [savedSchedulesCount, setSavedSchedulesCount] = useState(0);

    const [isCustomActive, setIsCustomActive] = useState(false);
    const [customOnDays, setCustomOnDays] = useState<number | string>(7);
    const [customOffDays, setCustomOffDays] = useState<number | string>(7);

    useEffect(() => {
        setSavedSchedulesCount(getSchedules().length);
    }, [isModalOpen]);

    useEffect(() => {
        if (isCustomActive) {
            const on = Number(customOnDays) || 0;
            const off = Number(customOffDays) || 0;
            if (on > 0 && off > 0) {
                setPattern(`${on}/${off}`);
            }
        }
    }, [customOnDays, customOffDays, isCustomActive]);

    const handleGenerateClick = () => {
        if (!startDate) {
            alert("Please select a start date.");
            return;
        }
        onGenerate(startDate, pattern);
    };
    
    const handleLoadAndGenerate = (start: string, pat: RotationPattern) => {
        setIsModalOpen(false);
        onGenerate(start, pat);
    };

    const handleCustomClick = () => {
        if (!isCustomActive) {
            // When switching to custom, parse the last active pattern
            const [on, off] = pattern.split('/').map(Number);
            setCustomOnDays(on || 7);
            setCustomOffDays(off || 7);
            setIsCustomActive(true);
        }
    };

    return (
        <div className="w-full max-w-md mx-auto my-8 transition-all duration-300 ease-in-out">
            <header className="flex flex-col items-center gap-2 mb-8 text-center">
                <div className="relative inline-block">
                    <h1 className="text-4xl sm:text-5xl brand-text-gradient font-dela-gothic">Offshore Mate</h1>
                    <span className="absolute top-0 right-0 -mt-2 -mr-5 sm:-mr-8 transform rotate-12 bg-orange-500 text-white text-xs font-bold uppercase px-2.5 py-1 rounded-full shadow-lg">
                        BETA
                    </span>
                </div>
                <p className="text-sm text-gray-400 font-medium max-w-xs mt-2">Your essential planner for offshore rotations.</p>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <div className="card col-span-2 rounded-2xl p-5">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#f97316]/20 p-2 rounded-full flex items-center justify-center">
                            <CalendarIcon className="text-orange-400 w-[22px] h-[22px]" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-50">Start Date</h2>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 mb-4">When does your rotation begin?</p>
                    <div className="relative">
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="w-full py-3.5 px-4 rounded-full bg-black/30 border border-white/20 text-gray-300 placeholder-gray-400 focus:ring-orange-500 focus:border-orange-500 transition font-numeric backdrop-blur-sm pr-12"
                            aria-label="Rotation start date"
                        />
                        <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none">
                            <CalendarIcon className="text-orange-400 w-5 h-5" />
                        </div>
                    </div>
                </div>

                <div className="card col-span-2 rounded-2xl p-5">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#f97316]/20 p-2 rounded-full flex items-center justify-center">
                            <ClockIcon className="text-orange-400 w-[22px] h-[22px]" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-50">Work Rotation Pattern</h2>
                    </div>
                    <p className="text-sm text-gray-400 mt-1 mb-4">Select your offshore work schedule.</p>
                    <div className="m3-segmented-button-group">
                        {PRESET_PATTERNS.map((p) => (
                            <button
                                key={p}
                                className={`m3-segmented-button ${!isCustomActive && pattern === p ? 'active' : ''}`}
                                onClick={() => {
                                    setPattern(p);
                                    setIsCustomActive(false);
                                }}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    
                    {/* Custom Pattern Section */}
                    <div className="mt-4">
                        <button
                            onClick={handleCustomClick}
                            className="w-full text-left text-sm font-semibold text-orange-400 hover:text-orange-300 transition-colors p-1 rounded"
                            aria-expanded={isCustomActive}
                            aria-controls="custom-pattern-inputs"
                        >
                            {isCustomActive ? `Editing Custom Pattern: ${pattern}` : '+ Set Custom Pattern'}
                        </button>
                        <div
                            id="custom-pattern-inputs"
                            className={`transition-all duration-300 ease-in-out overflow-hidden ${isCustomActive ? 'max-h-40 mt-2' : 'max-h-0'}`}
                        >
                            <div className="p-4 bg-black/20 rounded-xl border border-white/10">
                                <div className="flex gap-4">
                                    <div className="flex-1">
                                        <label htmlFor="on-days" className="block text-sm font-medium text-gray-400 mb-1">Days On</label>
                                        <input
                                            type="number"
                                            id="on-days"
                                            value={customOnDays}
                                            onChange={(e) => setCustomOnDays(e.target.value)}
                                            className="w-full py-2 px-3 text-center rounded-lg bg-black/30 border border-white/20 text-gray-200 focus:ring-orange-500 focus:border-orange-500 transition backdrop-blur-sm"
                                            min="1"
                                            aria-label="Custom days on"
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <label htmlFor="off-days" className="block text-sm font-medium text-gray-400 mb-1">Days Off</label>
                                        <input
                                            type="number"
                                            id="off-days"
                                            value={customOffDays}
                                            onChange={(e) => setCustomOffDays(e.target.value)}
                                            className="w-full py-2 px-3 text-center rounded-lg bg-black/30 border border-white/20 text-gray-200 focus:ring-orange-500 focus:border-orange-500 transition backdrop-blur-sm"
                                            min="1"
                                            aria-label="Custom days off"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div onClick={() => setIsModalOpen(true)} className="card rounded-full col-span-2 flex flex-row items-center justify-between p-4 cursor-pointer hover:border-orange-500/50 transition">
                    <div className="flex items-center gap-4">
                        <div className="bg-[#f97316]/20 p-2 rounded-full flex items-center justify-center">
                            <BookmarkIcon className="text-orange-400 w-[22px] h-[22px]" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-50">Saved Schedules</h2>
                            <p className="text-sm text-gray-400">Manage your schedules</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {savedSchedulesCount > 0 && (
                            <span className="text-orange-400 font-bold text-sm font-numeric">
                                {savedSchedulesCount}
                            </span>
                        )}
                        <ChevronRightIcon className="w-6 h-6 text-gray-400" />
                    </div>
                </div>

                <button onClick={handleGenerateClick} className="col-span-2 w-full text-white font-title py-4 px-4 rounded-full accent-button flex items-center justify-center text-lg shadow-lg">
                    Generate Schedule
                </button>
            </div>
            
            <SavedSchedulesModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onLoad={handleLoadAndGenerate}
            />
        </div>
    );
};

export default MainView;