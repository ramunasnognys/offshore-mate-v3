
import { RotationPattern, RotationStatus, ScheduleConfig } from '../types';

export const getRotationStatus = (
    date: Date,
    rotationStartDate: Date,
    rotationPattern: RotationPattern
): RotationStatus => {
    if (!rotationStartDate || !rotationPattern) {
        return { status: null, isFirstDay: false, isLastDay: false };
    }

    const [onDays, offDays] = rotationPattern.split('/').map(Number);
    const cycleLength = onDays + offDays;
    const msPerDay = 86400000;

    const diffDays = Math.floor(
        (Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) -
         Date.UTC(rotationStartDate.getFullYear(), rotationStartDate.getMonth(), rotationStartDate.getDate())) /
        msPerDay
    );

    if (diffDays < 0) {
        return { status: null, isFirstDay: false, isLastDay: false };
    }

    const dayInCycle = diffDays % cycleLength;
    const status = dayInCycle < onDays ? 'offshore' : 'onshore';
    const isFirstDay = status === 'offshore' && dayInCycle === 0;
    const isLastDay = status === 'offshore' && dayInCycle === onDays - 1;

    return { status, isFirstDay, isLastDay };
};


export const calculateTotalWorkDaysInYear = (
    scheduleConfig: Pick<ScheduleConfig, 'startDate' | 'pattern'>
): number => {
    const rotationStartDate = new Date(scheduleConfig.startDate + 'T00:00:00');
    
    let workDays = 0;
    const currentDate = new Date(rotationStartDate.getTime());
    const endDate = new Date(rotationStartDate.getTime());
    endDate.setDate(endDate.getDate() + 365);

    while (currentDate < endDate) {
        const { status } = getRotationStatus(currentDate, rotationStartDate, scheduleConfig.pattern);
        if (status === 'offshore') {
            workDays++;
        }
        currentDate.setDate(currentDate.getDate() + 1);
    }

    return workDays;
};

export const calculateMonthlyStats = (
    displayDate: Date,
    scheduleConfig: ScheduleConfig
): { offshoreDays: number; onshoreDays: number } => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rotationStartDate = new Date(scheduleConfig.startDate + 'T00:00:00');

    let offshoreDays = 0;
    let onshoreDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const { status } = getRotationStatus(currentDate, rotationStartDate, scheduleConfig.pattern);
        if (status === 'offshore') {
            offshoreDays++;
        } else if (status === 'onshore') {
            onshoreDays++;
        }
    }

    return { offshoreDays, onshoreDays };
};
