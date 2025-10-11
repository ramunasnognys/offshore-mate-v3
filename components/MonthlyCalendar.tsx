


import React, { useMemo, useState, useEffect, useRef } from 'react';
import { ScheduleConfig } from '../types';
import { getRotationStatus } from '../services/scheduleService';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface MonthlyCalendarProps {
    displayDate: Date;
    scheduleConfig: ScheduleConfig;
    onDayClick: (date: Date) => void;
    onNav: (direction: 'prev' | 'next') => void;
    onSetDate: (date: Date) => void;
}

const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const MonthlyCalendar: React.FC<MonthlyCalendarProps> = ({ displayDate, scheduleConfig, onDayClick, onNav, onSetDate }) => {
    
    const [isTransitioning, setIsTransitioning] = useState(false);

    // Fade in new month
    useEffect(() => {
        setIsTransitioning(false);
    }, [displayDate]);

    // Swipe gesture handling for mobile
    const touchStartX = useRef<number | null>(null);
    const touchEndX = useRef<number | null>(null);
    const minSwipeDistance = 50;

    const handleNavWithTransition = (direction: 'prev' | 'next') => {
        if (isTransitioning) return; // Prevent multiple navigations
        setIsTransitioning(true);
        setTimeout(() => {
            onNav(direction);
        }, 150); // Corresponds to half of the transition duration
    };
    
    const handleTouchStart = (e: React.TouchEvent) => {
        touchStartX.current = e.targetTouches[0].clientX;
        touchEndX.current = null;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (touchStartX.current !== null) {
            touchEndX.current = e.targetTouches[0].clientX;
        }
    };

    const handleTouchEnd = () => {
        if (touchStartX.current === null || touchEndX.current === null) return;

        const distance = touchStartX.current - touchEndX.current;
        
        if (distance > minSwipeDistance) {
            handleNavWithTransition('next'); // Left swipe
        } else if (distance < -minSwipeDistance) {
            handleNavWithTransition('prev'); // Right swipe
        }
        
        touchStartX.current = null;
        touchEndX.current = null;
    };
    
    const calendarGrid = useMemo(() => {
        const year = displayDate.getFullYear();
        const month = displayDate.getMonth();
        const rotationStartDate = new Date(scheduleConfig.startDate + 'T00:00:00');
        const todayString = new Date().toDateString();

        const gridStartDate = new Date(year, month, 1);
        const dayOfWeekForFirst = gridStartDate.getDay(); // 0=Sun, 1=Mon, ...
        gridStartDate.setDate(gridStartDate.getDate() - ((dayOfWeekForFirst + 6) % 7)); // Start on Monday of the first week

        const days = [];
        for (let i = 0; i < 42; i++) { // Always render 6 weeks for consistent height
            const currentDate = new Date(gridStartDate);
            currentDate.setDate(gridStartDate.getDate() + i);

            const isOtherMonth = currentDate.getMonth() !== month;
            const { status } = getRotationStatus(currentDate, rotationStartDate, scheduleConfig.pattern);

            const classes = ['calendar-day'];
            if (currentDate.toDateString() === todayString && !isOtherMonth) classes.push('today');
            
            if (isOtherMonth) {
                classes.push('other-month');
            } else if (status === 'travel') {
                classes.push('travel');
            } else if (status === 'offshore') {
                classes.push('offshore');
                
                const dayOfWeek = i % 7;
                if (dayOfWeek === 0) classes.push('is-first-col');
                if (dayOfWeek === 6) classes.push('is-last-col');

                const prevDate = new Date(currentDate);
                prevDate.setDate(currentDate.getDate() - 1);
                const nextDate = new Date(currentDate);
                nextDate.setDate(currentDate.getDate() + 1);

                const isPrevOffshore = getRotationStatus(prevDate, rotationStartDate, scheduleConfig.pattern).status === 'offshore';
                const isNextOffshore = getRotationStatus(nextDate, rotationStartDate, scheduleConfig.pattern).status === 'offshore';

                if (!isPrevOffshore && isNextOffshore) {
                    classes.push('offshore-start');
                } else if (isPrevOffshore && !isNextOffshore) {
                    classes.push('offshore-end');
                } else if (!isPrevOffshore && !isNextOffshore) {
                    classes.push('offshore-single');
                } else { // isPrevOffshore && isNextOffshore
                    classes.push('offshore-middle');
                }
            }

            days.push(
                <div 
                    key={currentDate.toISOString()} 
                    className={classes.join(' ')} 
                    onClick={() => !isOtherMonth && onDayClick(currentDate)}
                >
                    <span className="day-text font-numeric relative z-10">{currentDate.getDate()}</span>
                </div>
            );
        }
        return days;
    }, [displayDate, scheduleConfig, onDayClick]);

    return (
        <div 
            id="monthly-view-card" 
            className="card rounded-2xl p-6 shadow-lg flex flex-col"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            <div className="flex justify-between items-center mb-6">
                {/* Mobile Title */}
                <div className="md:hidden">
                    <h2 className="text-lg font-title text-orange-400">
                        {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(displayDate)}
                    </h2>
                    <p className="text-xs font-medium text-gray-500 -mt-1 font-numeric">
                        {displayDate.getFullYear()}
                    </p>
                </div>

                {/* Desktop Title */}
                <div className="hidden md:block">
                    <h2 className="text-2xl font-title text-orange-400">
                        {new Intl.DateTimeFormat('en-US', { month: 'long' }).format(displayDate)}
                    </h2>
                    <p className="text-sm font-medium text-gray-500 -mt-1 font-numeric">
                        {displayDate.getFullYear()}
                    </p>
                </div>

                {/* Navigation Controls */}
                <div className="flex items-center gap-1 md:gap-2">
                    <button onClick={() => handleNavWithTransition('prev')} className="calendar-nav-btn text-gray-400 w-9 h-9 md:w-10 md:h-10">
                        <ChevronLeftIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                    <button 
                        onClick={() => onSetDate(new Date())}
                        className="text-gray-300 font-semibold hover:text-white transition px-3 py-1 md:px-4 md:py-2 rounded-full hover:bg-gray-700 text-xs md:text-sm"
                    >
                        Today
                    </button>
                    <button onClick={() => handleNavWithTransition('next')} className="calendar-nav-btn text-gray-400 w-9 h-9 md:w-10 md:h-10">
                        <ChevronRightIcon className="w-5 h-5 md:w-6 md:h-6" />
                    </button>
                </div>
            </div>
            
            <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
                <div className="calendar-grid">
                    {DAY_NAMES.map((day, index) => (
                        <div key={index} className="calendar-day-name">{day}</div>
                    ))}
                </div>
                <hr className="border-white/10 my-3" />
                <div className="calendar-grid">
                    {calendarGrid}
                </div>
            </div>
        </div>
    );
};

export default MonthlyCalendar;