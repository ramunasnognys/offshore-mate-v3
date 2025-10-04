
import { ScheduleConfig } from '../types';

// These are loaded from CDNs in index.html, so we declare them here for TypeScript
declare var html2canvas: any;
declare var jspdf: any;

export const downloadPNG = async (element: HTMLElement, filename: string, showToast: (msg: string) => void) => {
    try {
        showToast('Preparing PNG...');
        const canvas = await html2canvas(element, { backgroundColor: '#111827', useCORS: true });
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvas.toDataURL();
        link.click();
    } catch (err) {
        console.error('PNG download error:', err);
        showToast('Error creating PNG.');
    }
};

export const downloadPDF = async (element: HTMLElement, filename: string, showToast: (msg: string) => void) => {
    try {
        const { jsPDF } = jspdf;
        showToast('Preparing PDF...');
        const canvas = await html2canvas(element, { backgroundColor: '#111827', scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/png');
        const imgWidth = canvas.width;
        const imgHeight = canvas.height;
        const orientation = imgWidth > imgHeight ? 'l' : 'p';
        const pdf = new jsPDF(orientation, 'px', [imgWidth, imgHeight]);
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
        pdf.save(filename);
    } catch (err) {
        console.error('PDF download error:', err);
        showToast('Error creating PDF.');
    }
};

export const exportICS = (scheduleConfig: ScheduleConfig, showToast: (msg: string) => void) => {
    const { startDate, pattern } = scheduleConfig;
    const rotationStartDate = new Date(startDate + 'T00:00:00');
    const [onDays, offDays] = pattern.split('/').map(Number);
    const cycleLength = onDays + offDays;

    const formatDateForICS = (date: Date) => date.toISOString().split('T')[0].replace(/-/g, '');
    
    let icsEvents = [];
    let currentEventStart = new Date(rotationStartDate.getTime());

    for (let i = 0; i < 50; i++) { // Generate for ~2 years
        const eventStart = new Date(currentEventStart.getTime());
        const eventEnd = new Date(eventStart.getTime());
        eventEnd.setDate(eventEnd.getDate() + onDays);

        const event = [
            'BEGIN:VEVENT',
            `UID:${eventStart.getTime()}@offshoremate.app`,
            `DTSTAMP:${new Date().toISOString().replace(/[-:.]/g, '')}Z`,
            `DTSTART;VALUE=DATE:${formatDateForICS(eventStart)}`,
            `DTEND;VALUE=DATE:${formatDateForICS(eventEnd)}`,
            'SUMMARY:Offshore Rotation',
            'END:VEVENT'
        ].join('\r\n');
        icsEvents.push(event);

        currentEventStart.setDate(currentEventStart.getDate() + cycleLength);
    }

    const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//OffshoreMate//App//EN',
        ...icsEvents,
        'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'offshore-schedule.ics';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('iCal file exported!');
};
