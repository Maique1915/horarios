import React from 'react';

const PixPayment = () => {
    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface-light dark:bg-surface-dark rounded-xl shadow-lg border border-border-light dark:border-border-dark p-8 text-center animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6 text-green-600 dark:text-green-400">
                    <span className="material-symbols-outlined text-4xl">check_circle</span>
                </div>
                <h2 className="text-2xl font-bold text-text-light-primary dark:text-text-dark-primary mb-2">Conta Criada/Atualizada!</h2>
                <p className="text-text-light-secondary dark:text-text-dark-secondary mb-6">
                    Para liberar seu acesso, efetue o pagamento via PIX.
                </p>

                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mb-6 border border-border-light dark:border-border-dark overflow-hidden flex flex-col items-center">
                    <p className="text-xs font-semibold uppercase text-slate-500 mb-1">Pagamento via PIX</p>
                    <p className="text-lg font-bold text-slate-800 dark:text-slate-200 mb-4">Valor: R$ 3,00</p>

                    <div className="bg-white p-2 rounded-lg border border-slate-200 mb-4">
                        <img
                            src="/lRVpOA.svg"
                            alt="QR Code PIX"
                            className="w-72 h-72 object-contain"
                        />
                    </div>

                    <p className="text-xs font-semibold uppercase text-slate-500 mb-2">Chave (Copia e Cola)</p>
                    <p className="text-sm font-mono font-bold text-primary select-all cursor-pointer break-all text-center" onClick={() => navigator.clipboard.writeText('https://nubank.com.br/cobrar/b5da35/69502bf1-5053-4657-a79b-172095c747ed')}>
                        https://nubank.com.br/cobrar/b5da35/69502bf1-5053-4657-a79b-172095c747ed
                    </p>
                    <p className="text-xs text-slate-400 mt-2">Clique no link para copiar</p>
                </div>

                <p className="text-sm text-text-light-secondary dark:text-text-dark-secondary mb-6">
                    Envie o comprovante para o WhatsApp abaixo para ativar sua conta.
                </p>

                <a
                    href="https://wa.me/5521988567387?text=Ol%C3%A1%2C%20segue%20meu%20comprovante%20de%20pagamento%20para%20libera%C3%A7%C3%A3o%20do%20Gerador%20de%20Hor%C3%A1rios."
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                >
                    <span className="material-symbols-outlined">send</span>
                    Enviar via WhatsApp (21 98856-7387)
                </a>
            </div>
        </div>
    );
};

export default PixPayment;
