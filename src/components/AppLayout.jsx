import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { preloadData } from '../model/loadData';

const AppLayout = () => {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
    const { cur } = useParams();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    useEffect(() => {
        preloadData();
    }, []);

    const hasCourseSelected = !!cur;

    const handleLogout = () => {
        if (confirm('Deseja realmente sair?')) {
            logout();
            navigate('/');
        }
    };

    const menuItems = [
        { to: `/${cur}`, icon: 'add_task', label: 'Gera Grade', end: true },
        { to: `/${cur}/grades`, icon: 'grid_on', label: 'Horários' },
        { to: `/${cur}/cronograma`, icon: 'timeline', label: 'Cronograma' },
    ];

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex">
            {/* Sidebar */}
            {hasCourseSelected && (
                <aside
                    className={`fixed left-0 top-0 h-screen bg-surface-light dark:bg-surface-dark border-r border-border-light dark:border-border-dark shadow-lg transition-all duration-300 ease-in-out z-50 ${isSidebarExpanded ? 'w-64' : 'w-20'
                        }`}
                >
                    {/* Header da Sidebar */}
                    <div className="flex items-center justify-between h-16 px-4 border-b border-border-light dark:border-border-dark">
                        <button
                            onClick={() => navigate('/')}
                            className="hover:opacity-80 cursor-pointer transition-opacity flex items-center gap-3"
                            title="Voltar para página inicial"
                        >
                            <img
                                src={`${import.meta.env.BASE_URL}/cefet-rj.jpg`}
                                alt="Logo"
                                className="w-10 h-10 rounded-full flex-shrink-0"
                            />
                            {/* Label que só aparece quando o menu está expandido */}
                            <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ml-2 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
                                CEFET-PET
                            </span>
                        </button>
                    </div>

                    {/* Menu Items */}
                    <nav className="flex flex-col z-50 gap-1 p-3 mt-4">
                        {menuItems.map((item) => (
                            <React.Fragment key={item.to}>
                                {item.divider && (
                                    <div className="h-px bg-border-light dark:bg-border-dark my-3" />
                                )}
                                <NavLink
                                    to={item.to}
                                    end={item.end}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all group relative ${isActive
                                            ? 'bg-primary text-white shadow-md'
                                            : 'text-text-light-primary dark:text-text-dark-primary hover:bg-primary/10'
                                        }`
                                    }
                                    title={!isSidebarExpanded ? item.label : ''}
                                >
                                    <span className="material-symbols-outlined text-2xl flex-shrink-0">
                                        {item.icon}
                                    </span>
                                    <span className={`whitespace-nowrap overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'
                                        }`}>
                                        {item.label}
                                    </span>

                                    {/* Tooltip para quando está recolhido */}
                                    {!isSidebarExpanded && (
                                        <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                            {item.label}
                                            <div className="absolute right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-gray-900 dark:border-r-gray-700"></div>
                                        </div>
                                    )}
                                </NavLink>
                            </React.Fragment>
                        ))}
                    </nav>

                    {/* Botão de Expandir/Recolher */}
                    <button
                        onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
                        className="absolute bottom-4 left-1/2 -translate-x-1/2 p-2 rounded-lg bg-primary text-white hover:bg-primary/90 transition-all shadow-lg"
                        title={isSidebarExpanded ? 'Recolher menu' : 'Expandir menu'}
                    >
                        <span className="material-symbols-outlined text-xl">
                            {isSidebarExpanded ? 'chevron_left' : 'chevron_right'}
                        </span>
                    </button>
                </aside>
            )}

            {/* Main Content */}
            <div className={`flex-1 transition-all duration-300 ${hasCourseSelected ? (isSidebarExpanded ? 'ml-64' : 'ml-20') : 'ml-0'
                }`}>
                {/* Top Bar */}
                <header className="sticky top-0 z-40 h-16 bg-surface-light dark:bg-surface-dark border-b border-border-light dark:border-border-dark shadow-sm">
                    <div className="h-full px-6 flex items-center justify-between">
                        <h1 className="text-xl font-bold text-text-light-primary dark:text-text-dark-primary">
                            Sistema de Matrículas {hasCourseSelected ? `- ${cur.toUpperCase()}` : ''}
                        </h1>

                        {/* Info adicional ou breadcrumbs podem ir aqui */}

                        <div className="flex items-center gap-4">
                            {user && (
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-lg">
                                        <span className="material-symbols-outlined text-lg text-primary">account_circle</span>
                                        <span className="text-sm font-medium text-primary">{user.name || user.username}</span>
                                    </div>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-text-light-secondary dark:text-text-dark-secondary hover:text-red-500 dark:hover:text-red-400 transition-colors"
                                        title="Sair"
                                    >
                                        <span className="material-symbols-outlined text-lg">logout</span>
                                        <span>Sair</span>
                                    </button>
                                </div>
                            )}

                            {hasCourseSelected && (
                                <NavLink
                                    to={`/${cur}/edit`}
                                    className="flex items-center gap-2 text-sm text-text-light-secondary dark:text-text-dark-secondary hover:text-primary transition-colors"
                                    title="Gerenciar disciplinas"
                                >
                                    <span className="material-symbols-outlined text-lg">settings</span>
                                    <span>Admin</span>
                                </NavLink>
                            )}
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="min-h-screen">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AppLayout;
