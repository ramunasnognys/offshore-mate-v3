
import React from 'react';
import { ScheduleConfig } from '../types';
import { calculateMonthlyStats, calculateTotalWorkDaysInYear } from '../services/scheduleService';
import { CalendarIcon } from './icons/CalendarIcon';
import { ClockIcon } from './icons/ClockIcon';

interface MonthlyViewSidebarProps {
    displayDate: Date;
    scheduleConfig: ScheduleConfig;
}

const MonthlyViewSidebar: React.FC<MonthlyViewSidebarProps> = ({ displayDate, scheduleConfig }) => {
    const { offshoreDays, onshoreDays } = calculateMonthlyStats(displayDate, scheduleConfig);
    const totalWorkDays = calculateTotalWorkDaysInYear(scheduleConfig);

    const formattedStartDate = new Date(scheduleConfig.startDate + 'T00:00:00').toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
    
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(displayDate);
    const totalDays = offshoreDays + onshoreDays;
    const offshorePercentage = totalDays > 0 ? (offshoreDays / totalDays) * 100 : 0;

    return (
        <div className="card rounded-2xl p-6 shadow-lg flex flex-col gap-6 h-fit">
            <div>
                <h3 className="text-lg font-bold text-gray-50 mb-4">Schedule Overview</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-3">
                        <ClockIcon className="w-5 h-5 text-orange-400" />
                        <span className="text-gray-400">Pattern:</span>
                        <strong className="text-gray-100">{scheduleConfig.pattern}</strong>
                    </div>
                    <div className="flex items-center gap-3">
                        <CalendarIcon className="w-5 h-5 text-orange-400" />
                        <span className="text-gray-400">Start Date:</span>
                        <strong className="text-gray-100">{formattedStartDate}</strong>
                    </div>
                     <div className="flex items-center gap-3">
                        <span className="material-icons-outlined text-orange-400 text-xl">assessment</span>
                        <span className="text-gray-400">Work Days (1yr):</span>
                        <strong className="text-gray-100">{totalWorkDays}</strong>
                    </div>
                </div>
            </div>

            <hr className="border-gray-700" />

            <div>
                <h3 className="text-lg font-bold text-gray-50 mb-4">Summary for {monthName}</h3>
                <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Work Days:</span>
                        <strong className="text-orange-400 font-semibold">{offshoreDays}</strong>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400">Off Days:</span>
                        <strong className="text-gray-100 font-semibold">{onshoreDays}</strong>
                    </div>
                    {totalDays > 0 && (
                        <div className="w-full bg-gray-700 rounded-full h-2.5 mt-2">
                            <div 
                                className="bg-orange-500 h-2.5 rounded-full" 
                                style={{ width: `${offshorePercentage}%` }}
                                title={`${Math.round(offshorePercentage)}% Work Period`}
                            ></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default MonthlyViewSidebar;
