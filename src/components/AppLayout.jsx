import React, { useState } from 'react';
import { Outlet, NavLink, useParams } from 'react-router-dom';

const AppLayout = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const { cur = 'engcomp' } = useParams();

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    const getLinkClass = ({ isActive }) => isActive ? 'bg-primary/10 text-primary' : 'hover:bg-primary/10';

    return (
        <div className="font-display bg-background-light dark:bg-background-dark text-text-light-primary dark:text-text-dark-primary">
            <div className="flex h-screen w-full flex-col">

                <header className="flex w-full flex-row border-b border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark p-2 items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src={`${import.meta.env.BASE_URL}icon.png`} alt="Admin Icon" className="size-10 rounded-full" />
                        <nav className="flex gap-2">
                            <NavLink className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getLinkClass({ isActive })}`} to={`/${cur}`} end>
                                <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>add_task</span>
                                <p className="text-sm font-medium leading-normal">Gera Grade ({cur})</p>
                            </NavLink>
                            <NavLink className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${getLinkClass({ isActive })}`} to={`/${cur}/grades`}>
                                <span className="material-symbols-outlined text-xl">grid_on</span>
                                <p className="text-sm font-medium leading-normal">Grade ({cur})</p>
                            </NavLink>
                            <NavLink className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors ${getLinkClass({ isActive })}`} to={`/${cur}/cronograma`}>
                                <span className="material-symbols-outlined text-xl">timeline</span>
                                <p className="text-sm font-medium leading-normal">Cronograma</p>
                            </NavLink>
                        </nav>
                    </div>
                    <div className="flex items-center gap-2">
                        <NavLink className={({ isActive }) => `flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary/10 transition-colors ${getLinkClass({ isActive })}`} to={`/${cur}/edit`}>
                            <span className="material-symbols-outlined text-xl">settings</span>
                            <p className="text-sm font-medium leading-normal">Edite</p>
                        </NavLink>

                    </div>
                </header>
                <main className="flex-1 overflow-y-auto">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}

export default AppLayout;
