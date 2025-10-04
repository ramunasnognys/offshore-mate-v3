

import React, { useState, useCallback, useRef } from 'react';
import { ScheduleConfig, Schedule, ViewMode } from '../types';
import MonthlyCalendar from './MonthlyCalendar';
import YearlyCalendar from './YearlyCalendar';
import AIBriefingModal from './AIBriefingModal';
import Toast from './Toast';
import SaveScheduleModal from './SaveScheduleModal';
import { useDropdown } from '../hooks/useDropdown';
import { downloadPNG, downloadPDF, exportICS } from '../utils/exportUtils';
import { addSchedule } from '../services/storageService';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';
import { ShareIcon } from './icons/ShareIcon';
import { DownloadIcon } from './icons/DownloadIcon';
import { BookmarkIcon } from './icons/BookmarkIcon';
import MonthlyViewSidebar from './MonthlyViewSidebar';
import { DotsVerticalIcon } from './icons/DotsVerticalIcon';

interface CalendarViewProps {
    scheduleConfig: ScheduleConfig;
    onBack: () => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({ scheduleConfig, onBack }) => {
    const [viewMode, setViewMode] = useState<ViewMode>('monthly');
    const [calendarDate, setCalendarDate] = useState(new Date(scheduleConfig.startDate + 'T00:00:00'));
    const [isBriefingModalOpen, setBriefingModalOpen] = useState(false);
    const [isSaveModalOpen, setSaveModalOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [toastMessage, setToastMessage] = useState('');

    const { isOpen: isShareOpen, toggle: toggleShare, ref: shareRef } = useDropdown<HTMLDivElement>();
    const { isOpen: isDownloadOpen, toggle: toggleDownload, ref: downloadRef } = useDropdown<HTMLDivElement>();
    const { isOpen: isMobileMenuOpen, toggle: toggleMobileMenu, ref: mobileMenuRef } = useDropdown<HTMLDivElement>();

    const monthlyViewRef = useRef<HTMLDivElement>(null);
    const yearlyViewRef = useRef<HTMLDivElement>(null);

    const showToast = (message: string) => {
        setToastMessage(message);
        setTimeout(() => setToastMessage(''), 3000);
    };

    const handleDayClick = useCallback((date: Date) => {
        setSelectedDate(date);
        setBriefingModalOpen(true);
    }, []);

    const handleMonthClick = useCallback((date: Date) => {
        setCalendarDate(date);
        setViewMode('monthly');
    }, []);

    const handleNav = (direction: 'prev' | 'next') => {
        const newDate = new Date(calendarDate);
        if (viewMode === 'monthly') {
            newDate.setMonth(newDate.getMonth() + (direction === 'prev' ? -1 : 1));
        } else {
            newDate.setFullYear(newDate.getFullYear() + (direction === 'prev' ? -1 : 1));
        }
        setCalendarDate(newDate);
    };
    
    const getShareableUrl = () => {
        const url = new URL(window.location.href);
        url.search = '';
        url.searchParams.set('start', scheduleConfig.startDate);
        url.searchParams.set('pattern', scheduleConfig.pattern);
        return url.toString();
    };
    
    const executeShare = async (type: 'generic' | 'whatsapp' | 'email' | 'copy') => {
        const url = getShareableUrl();
        const text = 'Check out my offshore rotation schedule!';
        
        if (type === 'copy') {
            await navigator.clipboard.writeText(url);
            showToast('Link copied to clipboard!');
        } else if (type === 'whatsapp') {
            window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank');
        } else if (type === 'email') {
            window.location.href = `mailto:?subject=${encodeURIComponent('My Offshore Schedule')}&body=${encodeURIComponent(`${text}\n${url}`)}`;
        } else if (type === 'generic' && navigator.share) {
            try {
                await navigator.share({ title: 'My Offshore Schedule', text, url });
            } catch (err) {
                console.error('Error sharing:', err);
            }
        }
    };

    const handleShare = (type: 'generic' | 'whatsapp' | 'email' | 'copy') => {
        executeShare(type);
        toggleShare();
    };

    const executeDownload = (type: 'png' | 'pdf' | 'ics') => {
        if (type === 'ics') {
            exportICS(scheduleConfig, showToast);
        } else {
            const elementToCapture = viewMode === 'monthly' ? monthlyViewRef.current : yearlyViewRef.current;
            if (elementToCapture) {
                const filename = `offshore-schedule-${viewMode}-${calendarDate.getFullYear()}.` + (type === 'png' ? 'png' : 'pdf');
                if (type === 'png') {
                    downloadPNG(elementToCapture, filename, showToast);
                } else {
                    downloadPDF(elementToCapture, filename, showToast);
                }
            }
        }
    };

    const handleDownload = (type: 'png' | 'pdf' | 'ics') => {
        executeDownload(type);
        toggleDownload();
    };
    
    const handleSaveSchedule = (name: string, description?: string) => {
        const newSchedule: Schedule = {
            id: Date.now().toString(),
            // FIX: Removed duplicate 'new' keyword, which was causing a syntax error.
            createdAt: new Date().toISOString(),
            name,
            description,
            startDate: scheduleConfig.startDate,
            pattern: scheduleConfig.pattern,
        };
        addSchedule(newSchedule);
        setSaveModalOpen(false);
        showToast('Schedule saved successfully!');
    };

    return (
        <div className="w-full max-w-5xl mx-auto mt-2 mb-4 md:my-8 transition-all duration-400 ease-in-out">
            <header className="flex justify-between items-center mb-4">
                <button onClick={onBack} className="flex items-center gap-1 md:gap-2 text-gray-300 font-medium hover:text-white transition p-2 hover:bg-white/10 rounded-lg">
                    <span className="material-icons-outlined text-xl md:text-2xl">arrow_back</span>
                    <span className="hidden sm:inline text-sm md:text-base">Back</span>
                </button>
                
                {/* Desktop Controls */}
                <div className="hidden md:flex items-center gap-1 md:gap-2">
                    <button onClick={() => setSaveModalOpen(true)} className="p-2 text-gray-300 hover:text-white transition hover:bg-white/10 rounded-lg" aria-label="Save schedule">
                        <BookmarkIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <div className="relative" ref={shareRef}>
                        <button onClick={toggleShare} className="p-2 text-gray-300 hover:text-white transition hover:bg-white/10 rounded-lg"><ShareIcon className="w-5 h-5 md:w-6 md:h-6" /></button>
                         {isShareOpen && (
                            <div className="action-dropdown absolute right-0 mt-2 w-56 rounded-xl shadow-lg z-10">
                                <a href="#" onClick={(e) => { e.preventDefault(); handleShare('generic'); }} className="flex items-center gap-3 p-3 text-sm text-gray-300 hover:bg-white/10 rounded-t-xl"><span className="material-icons-outlined text-base">ios_share</span> Share</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleShare('whatsapp'); }} className="flex items-center gap-3 p-3 text-sm text-gray-300 hover:bg-white/10">...</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleShare('email'); }} className="flex items-center gap-3 p-3 text-sm text-gray-300 hover:bg-white/10"><span className="material-icons-outlined text-base">email</span> Share via Email</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleShare('copy'); }} className="flex items-center gap-3 p-3 text-sm text-gray-300 hover:bg-white/10 rounded-b-xl"><span className="material-icons-outlined text-base">link</span> Copy Link</a>
                            </div>
                        )}
                    </div>
                    <div className="relative" ref={downloadRef}>
                        <button onClick={toggleDownload} className="p-2 text-gray-300 hover:text-white transition hover:bg-white/10 rounded-lg"><DownloadIcon className="w-5 h-5 md:w-6 md:h-6" /></button>
                        {isDownloadOpen && (
                            <div className="action-dropdown absolute right-0 mt-2 w-56 rounded-xl shadow-lg z-10">
                                <a href="#" onClick={(e) => { e.preventDefault(); handleDownload('png'); }} className="flex items-center gap-3 p-3 text-sm text-gray-300 hover:bg-white/10 rounded-t-xl"><span className="material-icons-outlined text-base">image</span> Download as PNG</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleDownload('pdf'); }} className="flex items-center gap-3 p-3 text-sm text-gray-300 hover:bg-white/10"><span className="material-icons-outlined text-base">picture_as_pdf</span> Download as PDF</a>
                                <a href="#" onClick={(e) => { e.preventDefault(); handleDownload('ics'); }} className="flex items-center gap-3 p-3 text-sm text-gray-300 hover:bg-white/10 rounded-b-xl"><span className="material-icons-outlined text-base">event</span> Export iCal (.ics)</a>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile Controls */}
                <div className="md:hidden relative" ref={mobileMenuRef}>
                    <button onClick={toggleMobileMenu} className="p-2 text-gray-300 hover:text-white transition hover:bg-white/10 rounded-lg" aria-label="Actions">
                        <DotsVerticalIcon className="w-6 h-6" />
                    </button>
                    <div className={`action-dropdown absolute right-0 mt-2 w-64 rounded-xl shadow-lg z-10 ${isMobileMenuOpen ? 'action-dropdown-visible' : 'action-dropdown-hidden'}`}>
                        <a href="#" onClick={(e) => { e.preventDefault(); setSaveModalOpen(true); toggleMobileMenu(); }} className="flex items-center gap-4 p-4 text-sm font-medium text-gray-200 hover:bg-white/10 rounded-t-xl">
                            <BookmarkIcon className="w-5 h-5 text-orange-400" />
                            <span>Save Schedule</span>
                        </a>
                        <hr className="border-gray-700/50" />
                        <a href="#" onClick={(e) => { e.preventDefault(); executeShare('generic'); toggleMobileMenu(); }} className="flex items-center gap-4 p-4 text-sm font-medium text-gray-200 hover:bg-white/10">
                            <ShareIcon className="w-5 h-5 text-orange-400" />
                            <span>Share</span>
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); executeShare('copy'); toggleMobileMenu(); }} className="flex items-center gap-4 p-4 text-sm font-medium text-gray-200 hover:bg-white/10">
                           <span className="material-icons-outlined text-orange-400 text-xl w-5 h-5 flex items-center justify-center">link</span>
                           <span>Copy Link</span>
                        </a>
                        <hr className="border-gray-700/50" />
                        <a href="#" onClick={(e) => { e.preventDefault(); executeDownload('png'); toggleMobileMenu(); }} className="flex items-center gap-4 p-4 text-sm font-medium text-gray-200 hover:bg-white/10">
                           <span className="material-icons-outlined text-orange-400 text-xl w-5 h-5 flex items-center justify-center">image</span>
                           <span>Download as PNG</span>
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); executeDownload('pdf'); toggleMobileMenu(); }} className="flex items-center gap-4 p-4 text-sm font-medium text-gray-200 hover:bg-white/10">
                           <span className="material-icons-outlined text-orange-400 text-xl w-5 h-5 flex items-center justify-center">picture_as_pdf</span>
                           <span>Download as PDF</span>
                        </a>
                        <a href="#" onClick={(e) => { e.preventDefault(); executeDownload('ics'); toggleMobileMenu(); }} className="flex items-center gap-4 p-4 text-sm font-medium text-gray-200 hover:bg-white/10 rounded-b-xl">
                           <span className="material-icons-outlined text-orange-400 text-xl w-5 h-5 flex items-center justify-center">event</span>
                           <span>Export iCal (.ics)</span>
                        </a>
                    </div>
                </div>
            </header>
            
            <div className="w-full mt-4 md:mt-6">
                {/* Mobile Controls: Centered column */}
                <div className="md:hidden flex flex-col items-center gap-4">
                    <div className="flex items-center justify-center w-full min-h-[44px]">
                        {viewMode === 'monthly' && (
                            <h2 className="text-xl font-bold text-gray-50 flex-grow text-center">
                                {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(calendarDate)}
                            </h2>
                        )}
                        {viewMode === 'yearly' && (
                             <div className="flex items-center justify-center gap-4 w-full">
                                <button onClick={() => handleNav('prev')} className="calendar-nav-btn text-gray-400 w-9 h-9">
                                    <ChevronLeftIcon className="w-5 h-5" />
                                </button>
                                <h2 className="text-xl font-bold text-gray-50 text-center w-24">
                                    {calendarDate.getFullYear()}
                                </h2>
                                <button onClick={() => handleNav('next')} className="calendar-nav-btn text-gray-400 w-9 h-9">
                                    <ChevronRightIcon className="w-5 h-5" />
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="m3-segmented-button-group w-full max-w-xs mx-auto">
                        <button onClick={() => setViewMode('monthly')} className={`m3-segmented-button ${viewMode === 'monthly' ? 'active' : ''}`}>Monthly</button>
                        <button onClick={() => setViewMode('yearly')} className={`m3-segmented-button ${viewMode === 'yearly' ? 'active' : ''}`}>Yearly</button>
                    </div>
                </div>

                {/* Desktop Controls */}
                <div className="hidden md:block">
                    {/* Monthly view: 3-col grid */}
                    {viewMode === 'monthly' && (
                         <div className="grid grid-cols-3 items-center gap-4">
                            <div /> {/* Spacer */}
                            <div className="m3-segmented-button-group w-full max-w-xs mx-auto justify-self-center">
                                {/* FIX: Replaced conditional className with static value because the outer condition already guarantees the viewMode. */}
                                <button onClick={() => setViewMode('monthly')} className="m3-segmented-button active">Monthly</button>
                                <button onClick={() => setViewMode('yearly')} className="m3-segmented-button">Yearly</button>
                            </div>
                            <h2 className="text-xl font-bold text-gray-50 justify-self-end self-end">
                                {new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(calendarDate)}
                            </h2>
                        </div>
                    )}
                    {/* Yearly view: 3-col grid */}
                    {viewMode === 'yearly' && (
                        <div className="grid grid-cols-3 items-center gap-4">
                            <div /> {/* Spacer */}
                            <div className="m3-segmented-button-group w-full max-w-xs mx-auto justify-self-center">
                                <button onClick={() => setViewMode('monthly')} className="m3-segmented-button">Monthly</button>
                                <button onClick={() => setViewMode('yearly')} className="m3-segmented-button active">Yearly</button>
                            </div>
                             <div className="flex items-center justify-self-end self-end gap-2">
                                <button onClick={() => handleNav('prev')} className="calendar-nav-btn text-gray-400 w-10 h-10">
                                    <ChevronLeftIcon className="w-6 h-6" />
                                </button>
                                <h2 className="text-xl font-bold text-gray-50 text-center w-24">
                                    {calendarDate.getFullYear()}
                                </h2>
                                <button onClick={() => handleNav('next')} className="calendar-nav-btn text-gray-400 w-10 h-10">
                                    <ChevronRightIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            <hr className="border-white/10 mt-4 mb-4 md:mt-6 md:mb-6" />

            <div className="lg:grid lg:grid-cols-3 lg:gap-x-8 items-start">
                {/* Sidebar Column */}
                {viewMode === 'monthly' && (
                    <div className="hidden lg:block lg:col-span-1">
                        <MonthlyViewSidebar displayDate={calendarDate} scheduleConfig={scheduleConfig} />
                    </div>
                )}

                {/* Main Calendar Area */}
                <div className={viewMode === 'monthly' ? 'lg:col-span-2' : 'lg:col-span-3'}>
                    <div className={viewMode === 'monthly' ? '' : 'hidden'}>
                        <div ref={monthlyViewRef}>
                            <MonthlyCalendar 
                                displayDate={calendarDate} 
                                scheduleConfig={scheduleConfig} 
                                onDayClick={handleDayClick}
                                onNav={handleNav}
                                onSetDate={setCalendarDate}
                            />
                        </div>
                    </div>
                    <div className={viewMode === 'yearly' ? '' : 'hidden'}>
                         <div ref={yearlyViewRef}>
                            <YearlyCalendar 
                                displayDate={calendarDate} 
                                scheduleConfig={scheduleConfig} 
                                onMonthClick={handleMonthClick}
                             />
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-center items-center gap-8 mt-8 pt-6 border-t border-white/10">
                <div className="legend-item">
                    <div className="legend-dot border-orange-400"></div>
                    <span className="text-sm font-medium text-gray-400">Offshore</span>
                </div>
                <div className="legend-item">
                    <div className="legend-dot border-gray-500"></div>
                    <span className="text-sm font-medium text-gray-400">Onshore</span>
                </div>
            </div>
            
            <AIBriefingModal isOpen={isBriefingModalOpen} onClose={() => setBriefingModalOpen(false)} date={selectedDate} scheduleConfig={scheduleConfig} />
            <SaveScheduleModal isOpen={isSaveModalOpen} onClose={() => setSaveModalOpen(false)} onSave={handleSaveSchedule} />
            <Toast message={toastMessage} />
        </div>
    );
};

export default CalendarView;