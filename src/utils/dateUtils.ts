export const getCurrentPeriod = (): string => {
    const dataAtual = new Date();
    const mesAtual = dataAtual.getMonth() + 1;
    const anoAtual = dataAtual.getFullYear();
    // 1st semester (Jan-Jun), 2nd semester (Jul-Dec)
    return `${anoAtual}.${mesAtual > 6 ? "2" : "1"}`;
};
