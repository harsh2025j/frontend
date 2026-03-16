export const formatDate = (date: string | Date | undefined | null): string => {
    if (!date) return "-";
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "-";
        return d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    } catch (error) {
        return "-";
    }
};

export const formatDateTime = (date: string | Date | undefined | null): string => {
    if (!date) return "-";
    try {
        const d = new Date(date);
        if (isNaN(d.getTime())) return "-";
        const dateStr = d.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        const timeStr = d.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
        return `${dateStr} ${timeStr}`;
    } catch (error) {
        return "-";
    }
};