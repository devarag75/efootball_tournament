import { NavLink, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, Trophy, Users, Calendar, BarChart3, GitBranch,
    Settings, LogOut, X, Shield
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/tournaments', icon: Trophy, label: 'Tournaments' },
];

export default function Sidebar({ open, onClose }) {
    const { user, role, logout } = useAuth();
    const location = useLocation();

    // Check if inside a tournament context
    const tournamentMatch = location.pathname.match(/\/tournaments\/([^/]+)/);
    const tournamentId = tournamentMatch ? tournamentMatch[1] : null;

    const tournamentItems = tournamentId ? [
        { to: `/tournaments/${tournamentId}`, icon: LayoutDashboard, label: 'Overview', exact: true },
        { to: `/tournaments/${tournamentId}/teams`, icon: Users, label: 'Teams' },
        { to: `/tournaments/${tournamentId}/matches`, icon: Calendar, label: 'Matches' },
        { to: `/tournaments/${tournamentId}/standings`, icon: BarChart3, label: 'Standings' },
        { to: `/tournaments/${tournamentId}/bracket`, icon: GitBranch, label: 'Bracket' },
    ] : [];

    return (
        <>
            {/* Overlay for mobile */}
            {open && (
                <div className="fixed inset-0 bg-black/60 z-40 lg:hidden" onClick={onClose} />
            )}

            <aside className={`
        fixed top-0 left-0 z-50 h-full w-[260px] bg-[var(--color-dark-800)]
        border-r border-[var(--color-dark-600)] flex flex-col
        transition-transform duration-300 ease-out
        ${open ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:z-auto
      `}>
                {/* Logo */}
                <div className="p-5 flex items-center justify-between border-b border-[var(--color-dark-600)]">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--color-accent-400)] to-[#818cf8] flex items-center justify-center">
                            <Trophy size={18} className="text-white" />
                        </div>
                        <div>
                            <h1 className="font-bold text-base text-white tracking-tight">TournamentOS</h1>
                            <p className="text-[10px] text-[var(--color-accent-400)] uppercase tracking-widest font-medium">Platform</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white p-1">
                        <X size={18} />
                    </button>
                </div>

                {/* Main Nav */}
                <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
                    <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-2">Main</p>
                    {navItems.map(item => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end
                            onClick={onClose}
                            className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                                    ? 'bg-[var(--color-accent-400)]/10 text-[var(--color-accent-400)] shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-white/5'}
              `}
                        >
                            <item.icon size={18} />
                            {item.label}
                        </NavLink>
                    ))}

                    {/* Tournament sub-nav */}
                    {tournamentItems.length > 0 && (
                        <>
                            <div className="pt-4 pb-1">
                                <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Tournament</p>
                            </div>
                            {tournamentItems.map(item => (
                                <NavLink
                                    key={item.to}
                                    to={item.to}
                                    end={item.exact}
                                    onClick={onClose}
                                    className={({ isActive }) => `
                    flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                    ${isActive
                                            ? 'bg-[var(--color-accent-400)]/10 text-[var(--color-accent-400)] shadow-sm'
                                            : 'text-slate-400 hover:text-white hover:bg-white/5'}
                  `}
                                >
                                    <item.icon size={18} />
                                    {item.label}
                                </NavLink>
                            ))}
                        </>
                    )}

                    {role === 'admin' && (
                        <>
                            <div className="pt-4 pb-1">
                                <p className="px-3 text-[10px] font-semibold text-slate-500 uppercase tracking-widest">Admin</p>
                            </div>
                            <NavLink
                                to="/admin/users"
                                onClick={onClose}
                                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
                  ${isActive
                                        ? 'bg-[var(--color-accent-400)]/10 text-[var(--color-accent-400)] shadow-sm'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'}
                `}
                            >
                                <Shield size={18} />
                                User Management
                            </NavLink>
                        </>
                    )}
                </nav>

                {/* User Info */}
                <div className="p-4 border-t border-[var(--color-dark-600)]">
                    <div className="flex items-center gap-3 mb-3">
                        {user?.photoURL ? (
                            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full ring-2 ring-[var(--color-dark-600)]" />
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-[var(--color-dark-600)] flex items-center justify-center text-xs font-bold text-[var(--color-accent-400)]">
                                {user?.displayName?.[0] || '?'}
                            </div>
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{user?.displayName}</p>
                            <p className="text-[11px] text-slate-500 capitalize">{role}</p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
                    >
                        <LogOut size={16} />
                        Sign Out
                    </button>
                </div>
            </aside>
        </>
    );
}
