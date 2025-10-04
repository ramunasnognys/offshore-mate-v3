import React, { useState, useEffect, useCallback } from 'react';
import MainView from './components/MainView';
import CalendarView from './components/CalendarView';
import { RotationPattern, ScheduleConfig } from './types';

const App: React.FC = () => {
    const [activeScheduleConfig, setActiveScheduleConfig] = useState<ScheduleConfig | null>(null);

    const handleGenerateSchedule = useCallback((startDate: string, pattern: RotationPattern) => {
        setActiveScheduleConfig({ startDate, pattern });
    }, []);

    const handleBackToMain = () => {
        setActiveScheduleConfig(null);
    };

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const start = params.get('start');
        const pattern = params.get('pattern') as RotationPattern;

        if (start && pattern) {
            handleGenerateSchedule(start, pattern);
             // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }, [handleGenerateSchedule]);

    return (
        <div className="flex justify-center items-start min-h-screen p-4">
            {!activeScheduleConfig ? (
                <MainView onGenerate={handleGenerateSchedule} />
            ) : (
                <CalendarView scheduleConfig={activeScheduleConfig} onBack={handleBackToMain} />
            )}
        </div>
    );
};

export default App;