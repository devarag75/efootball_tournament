import { Menu, Bell } from 'lucide-react';

export default function Header({ onMenuToggle, title, subtitle }) {
    return (
        <header className="sticky top-0 z-30 bg-[var(--color-dark-900)]/80 backdrop-blur-xl border-b border-[var(--color-dark-600)]">
            <div className="flex items-center justify-between px-4 lg:px-6 h-16">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuToggle}
                        className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all"
                    >
                        <Menu size={20} />
                    </button>
                    <div>
                        <h2 className="text-lg font-bold text-white">{title || 'Dashboard'}</h2>
                        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 transition-all relative">
                        <Bell size={18} />
                        <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-accent-400)] rounded-full" />
                    </button>
                </div>
            </div>
        </header>
    );
}
