
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

    const calculateStatusForDate = (d: Date): RotationStatus => {
        const diff = Math.floor(
            (Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) -
             Date.UTC(rotationStartDate.getFullYear(), rotationStartDate.getMonth(), rotationStartDate.getDate())) /
            msPerDay
        );

        if (diff < 0) {
            return { status: null, isFirstDay: false, isLastDay: false };
        }
        
        const dayInCycle = diff % cycleLength;
        const currentStatus = dayInCycle < onDays ? 'offshore' : 'onshore';
        const isFirst = currentStatus === 'offshore' && dayInCycle === 0;
        const isLast = currentStatus === 'offshore' && dayInCycle === onDays - 1;

        return { status: currentStatus, isFirstDay: isFirst, isLastDay: isLast };
    };

    const todayStatus = calculateStatusForDate(date);
    
    if (todayStatus.status === 'offshore') {
        return todayStatus;
    }

    // Check for travel days if today is onshore
    if (todayStatus.status === 'onshore') {
        // Is tomorrow the first day offshore? -> Today is travel day
        const tomorrow = new Date(date.getTime() + msPerDay);
        const tomorrowStatus = calculateStatusForDate(tomorrow);
        if (tomorrowStatus.isFirstDay) {
            return { status: 'travel', isFirstDay: false, isLastDay: false };
        }

        // Was yesterday the last day offshore? -> Today is travel day
        const yesterday = new Date(date.getTime() - msPerDay);
        const yesterdayStatus = calculateStatusForDate(yesterday);
        if (yesterdayStatus.isLastDay) {
            return { status: 'travel', isFirstDay: false, isLastDay: false };
        }
    }
    
    // Default to original status if not a travel day
    return todayStatus;
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
): { offshoreDays: number; onshoreDays: number; travelDays: number } => {
    const year = displayDate.getFullYear();
    const month = displayDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const rotationStartDate = new Date(scheduleConfig.startDate + 'T00:00:00');

    let offshoreDays = 0;
    let onshoreDays = 0;
    let travelDays = 0;

    for (let day = 1; day <= daysInMonth; day++) {
        const currentDate = new Date(year, month, day);
        const { status } = getRotationStatus(currentDate, rotationStartDate, scheduleConfig.pattern);
        if (status === 'offshore') {
            offshoreDays++;
        } else if (status === 'onshore') {
            onshoreDays++;
        } else if (status === 'travel') {
            travelDays++;
        }
    }

    return { offshoreDays, onshoreDays, travelDays };
};