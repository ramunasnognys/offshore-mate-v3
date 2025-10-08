

import React, { useMemo } from 'react';
import { ScheduleConfig } from '../types';
import { getRotationStatus } from '../services/scheduleService';

interface YearlyCalendarProps {
    displayDate: Date;
    scheduleConfig: ScheduleConfig;
    onMonthClick: (date: Date) => void;
}

const DAY_NAMES = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

const MiniCalendar: React.FC<{ monthDate: Date; scheduleConfig: ScheduleConfig; onMonthClick: (date: Date) => void; isCurrentMonth: boolean; }> = ({ monthDate, scheduleConfig, onMonthClick, isCurrentMonth }) => {
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const rotationStartDate = new Date(scheduleConfig.startDate + 'T00:00:00');
    const todayString = new Date().toDateString();

    const monthGrid = useMemo(() => {
        const gridStartDate = new Date(year, month, 1);
        const dayOfWeekForFirst = gridStartDate.getDay(); // 0=Sun, 1=Mon, ...
        gridStartDate.setDate(gridStartDate.getDate() - ((dayOfWeekForFirst + 6) % 7)); // Start on Monday of the first week

        const days = [];
        for (let i = 0; i < 42; i++) { // Always render 6 weeks for consistent height
            const currentDate = new Date(gridStartDate);
            currentDate.setDate(gridStartDate.getDate() + i);

            const { status } = getRotationStatus(currentDate, rotationStartDate, scheduleConfig.pattern);
            const isOtherMonth = currentDate.getMonth() !== month;
            
            const classes = ['mini-calendar-day'];
            if (currentDate.toDateString() === todayString && !isOtherMonth) classes.push('today');
            
            if (isOtherMonth) {
                classes.push('other-month');
            } else if (status === 'offshore') {
                classes.push('offshore');
                
                const dayOfWeek = i % 7;
                if (dayOfWeek === 0) classes.push('is-first-col');
                if (dayOfWeek === 6) classes.push('is-last-col');

                const prevDate = new Date(currentDate);
                prevDate.setDate(currentDate.getDate() - 1);
                const nextDate = new Date(currentDate);
                nextDate.setDate(currentDate.getDate() + 1);
                
                const isPrevOffshore = prevDate.getMonth() === month && getRotationStatus(prevDate, rotationStartDate, scheduleConfig.pattern).status === 'offshore';
                const isNextOffshore = nextDate.getMonth() === month && getRotationStatus(nextDate, rotationStartDate, scheduleConfig.pattern).status === 'offshore';
    
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
                <div key={currentDate.toISOString()} className={classes.join(' ')}>
                    <span className="day-text font-numeric">{currentDate.getDate()}</span>
                </div>
            );
        }
        return days;
    }, [year, month, scheduleConfig.pattern, rotationStartDate, todayString]);

    const miniCalendarClasses = [
        'mini-calendar',
        'card',
        'rounded-2xl',
        'p-4',
        'transition-all',
        'duration-200',
        'ease-in-out',
        'cursor-pointer',
        'flex',
        'flex-col',
        isCurrentMonth ? 'is-current-month' : ''
    ].join(' ');

    return (
        <div className={miniCalendarClasses} onClick={() => onMonthClick(monthDate)}>
            <h3 className="font-title text-left text-orange-400 mb-2 text-sm tracking-wider">
                {new Intl.DateTimeFormat('en-US', { month: 'short' }).format(monthDate).toUpperCase()}
            </h3>
            <div className="grid grid-cols-7">
                {DAY_NAMES.map((day, index) => <div key={index} className="text-xs font-medium text-gray-400 text-center">{day}</div>)}
            </div>
            <hr className="border-white/10 my-1.5" />
            <div className="grid grid-cols-7 gap-1 flex-grow">
                {monthGrid}
            </div>
        </div>
    );
};

const YearlyCalendar: React.FC<YearlyCalendarProps> = ({ displayDate, scheduleConfig, onMonthClick }) => {
    const year = displayDate.getFullYear();
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    const months = useMemo(() => {
        return Array.from({ length: 12 }, (_, i) => new Date(year, i, 1));
    }, [year]);

    return (
        <div id="yearly-calendar-grid">
            {months.map(monthDate => (
                <MiniCalendar
                    key={monthDate.getMonth()}
                    monthDate={monthDate}
                    scheduleConfig={scheduleConfig}
                    onMonthClick={onMonthClick}
                    isCurrentMonth={year === currentYear && monthDate.getMonth() === currentMonth}
                />
            ))}
        </div>
    );
};

export default YearlyCalendar;