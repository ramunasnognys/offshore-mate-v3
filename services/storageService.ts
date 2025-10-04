
import { Schedule } from '../types';

const SCHEDULES_DB_KEY = 'offshoreMateSchedules';

export const getSchedules = (): Schedule[] => {
    try {
        const schedulesJSON = localStorage.getItem(SCHEDULES_DB_KEY);
        if (!schedulesJSON) return [];

        const schedulesData: any[] = JSON.parse(schedulesJSON);

        // Data migration for old format
        const migratedSchedules: Schedule[] = schedulesData.map(s => {
            if (!s.createdAt) {
                // This is an old schedule object
                return {
                    id: s.id,
                    startDate: s.startDate,
                    pattern: s.pattern,
                    name: `Rotation (${s.pattern})`,
                    description: `Starts on ${new Date(s.startDate + 'T00:00:00').toLocaleDateString()}`,
                    createdAt: s.id ? new Date(parseInt(s.id, 10)).toISOString() : new Date().toISOString(),
                };
            }
            return s as Schedule;
        });

        // Sort by createdAt descending
        migratedSchedules.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return migratedSchedules;
    } catch (error) {
        console.error("Failed to parse schedules from localStorage", error);
        return [];
    }
};

export const saveSchedules = (schedules: Schedule[]): void => {
    try {
        localStorage.setItem(SCHEDULES_DB_KEY, JSON.stringify(schedules));
    } catch (error) {
        console.error("Failed to save schedules to localStorage", error);
    }
};

export const addSchedule = (newSchedule: Schedule): void => {
    const schedules = getSchedules();
    const updatedSchedules = [newSchedule, ...schedules];
    saveSchedules(updatedSchedules);
};

export const deleteSchedule = (scheduleId: string): void => {
    let schedules = getSchedules();
    schedules = schedules.filter(s => s.id !== scheduleId);
    saveSchedules(schedules);
};
