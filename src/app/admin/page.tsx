export default function AdminPage() {
    return (
        <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold mb-6">Painel Administrativo</h1>
            <p className="mb-4 text-text-light-secondary dark:text-text-dark-secondary">
                Selecione uma tabela no menu lateral para gerenciar os dados do sistema.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h3 className="font-semibold text-blue-800 dark:text-blue-300 mb-2">Atenção</h3>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                    As alterações feitas aqui refletem diretamente no banco de dados. Tenha cuidado ao excluir ou modificar registros que podem ter dependências.
                </p>
            </div>
        </div>
    );
}
