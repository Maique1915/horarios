import React from 'react';

/**
 * Componente de Loading padronizado para todo o sistema
 * 
 * @param {Object} props
 * @param {string} [props.message] - Mensagem principal a ser exibida (padrão: "Carregando...")
 * @param {string} [props.submessage] - Mensagem secundária opcional
 * @param {boolean} [props.fullscreen] - Se true, ocupa a tela inteira (padrão: true)
 * @param {'sm'|'md'|'lg'|'xl'} [props.size] - Tamanho do spinner: 'sm', 'md', 'lg', 'xl' (padrão: 'lg')
 */
const LoadingSpinner = ({
    message = "Carregando...",
    submessage = null,
    fullscreen = true,
    size = 'lg'
}) => {
    const sizeClasses = {
        sm: 'h-8 w-8',
        md: 'h-12 w-12',
        lg: 'h-16 w-16',
        xl: 'h-20 w-20'
    };

    const containerClasses = fullscreen
        ? "flex items-center justify-center min-h-screen bg-background-light dark:bg-background-dark"
        : "flex items-center justify-center p-8";

    return (
        <div className={containerClasses}>
            <div className="text-center">
                {/* Spinner animado */}
                <div className={`animate-spin rounded-full ${sizeClasses[size]} border-4 border-slate-200 dark:border-slate-700 border-t-primary mx-auto mb-4`}></div>

                {/* Mensagem principal */}
                <p className="text-text-light-secondary dark:text-text-dark-secondary text-lg font-medium mb-2">
                    {message}
                </p>

                {/* Mensagem secundária (opcional) */}
                {submessage && (
                    <p className="text-xs text-text-light-secondary dark:text-text-dark-secondary opacity-75">
                        {submessage}
                    </p>
                )}
            </div>
        </div>
    );
};

/**
 * Variante inline do loading (para usar dentro de componentes)
 */
export const InlineLoadingSpinner = ({ message = "Carregando...", size = 'md' }) => {
    return (
        <LoadingSpinner
            message={message}
            fullscreen={false}
            size={size}
        />
    );
};

/**
 * Loading para operações de salvamento/sincronização
 */
export const SavingSpinner = ({ message = "Salvando no Google Sheets..." }) => {
    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-surface-light dark:bg-surface-dark rounded-xl border border-border-light dark:border-border-dark shadow-2xl p-8 max-w-sm">
                <div className="text-center">
                    {/* Ícone de nuvem com animação */}
                    <div className="relative mb-4">
                        <span className="material-symbols-outlined text-6xl text-primary animate-pulse">
                            cloud_upload
                        </span>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-primary opacity-30"></div>
                        </div>
                    </div>

                    {/* Mensagem */}
                    <p className="text-text-light-primary dark:text-text-dark-primary text-lg font-semibold mb-2">
                        {message}
                    </p>
                    <p className="text-text-light-secondary dark:text-text-dark-secondary text-sm">
                        Por favor, aguarde...
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoadingSpinner;
