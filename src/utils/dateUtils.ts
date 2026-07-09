export const getCurrentPeriod = (date?: Date): string => {
    const dataAtual = date || new Date();
    const mesAtual = dataAtual.getMonth() + 1;
    const anoAtual = dataAtual.getFullYear();
    // 1st semester (Jan-Jun), 2nd semester (Jul-Dec)
    return `${anoAtual}.${mesAtual > 6 ? "2" : "1"}`;
};

/**
 * Returns true if today falls within the configured academic period.
 * Falls back to the legacy getCurrentPeriod logic if dates are not set.
 */
export const isPeriodActive = (
    periodStart: string | null | undefined,
    periodEnd: string | null | undefined
): boolean => {
    if (!periodStart || !periodEnd) {
        // Fallback: consider the period always active (legacy behavior)
        return true;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(periodStart + 'T00:00:00');
    const end = new Date(periodEnd + 'T23:59:59');
    return today >= start && today <= end;
};

/**
 * Returns true if the academic period has ended but we are within
 * the review window (default: 60 days after period_end).
 * This is when the user should confirm which subjects they passed.
 */
export const isInReviewWindow = (
    periodStart: string | null | undefined,
    periodEnd: string | null | undefined,
    reviewWindowDays = 60
): boolean => {
    if (!periodStart || !periodEnd) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(periodEnd + 'T00:00:00');
    const windowEnd = new Date(end);
    windowEnd.setDate(windowEnd.getDate() + reviewWindowDays);
    // Period must have ended and we must be within the review window
    return today > end && today <= windowEnd;
};
