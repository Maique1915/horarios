export const calculateComplementaryActivities = (
    minHours: number,
    complementaryHours: number | null
) => {
    return {
        currentHours: Math.min(minHours, complementaryHours || 0),
        customTotalHours: complementaryHours || 0
    };
};
