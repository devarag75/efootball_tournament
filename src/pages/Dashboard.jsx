import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Users, Calendar, TrendingUp, ArrowRight, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTournaments } from '../services/tournamentService';

export default function Dashboard() {
    const { user, role } = useAuth();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData() {
        try {
            const data = await getTournaments();
            setTournaments(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    const totalTeams = tournaments.reduce((sum, t) => sum + (t.teamCount || 0), 0);
    const totalMatches = tournaments.reduce((sum, t) => sum + (t.matchCount || 0), 0);
    const activeTournaments = tournaments.filter(t => t.status === 'active').length;

    const stats = [
        { label: 'Total Tournaments', value: tournaments.length, icon: Trophy, color: 'from-[var(--color-accent-400)] to-blue-500', bg: 'bg-[var(--color-accent-400)]/10' },
        { label: 'Active', value: activeTournaments, icon: Activity, color: 'from-emerald-400 to-emerald-600', bg: 'bg-emerald-400/10' },
        { label: 'Total Teams', value: totalTeams, icon: Users, color: 'from-purple-400 to-purple-600', bg: 'bg-purple-400/10' },
        { label: 'Matches Played', value: totalMatches, icon: Calendar, color: 'from-amber-400 to-orange-500', bg: 'bg-amber-400/10' },
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[var(--color-accent-400)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">
                        Welcome back, <span className="gradient-text">{user?.displayName?.split(' ')[0] || 'User'}</span>
                    </h1>
                    <p className="text-slate-400 text-sm mt-1">Here's what's happening across your tournaments</p>
                </div>
                {(role === 'admin' || role === 'organizer') && (
                    <Link
                        to="/tournaments"
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-accent-400)] to-blue-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-[var(--color-accent-400)]/20 transition-all active:scale-95"
                    >
                        <Trophy size={16} />
                        New Tournament
                    </Link>
                )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={stat.label} className={`glass-card p-5 animate-fade-in-up delay-${i + 1}`}>
                        <div className="flex items-center justify-between mb-3">
                            <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                                <stat.icon size={18} className={`bg-gradient-to-r ${stat.color} bg-clip-text`} style={{ color: 'var(--color-accent-400)' }} />
                            </div>
                            <TrendingUp size={14} className="text-emerald-400" />
                        </div>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Recent Tournaments */}
            <div className="glass-card p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-white">Recent Tournaments</h3>
                    <Link to="/tournaments" className="text-[var(--color-accent-400)] text-xs font-medium hover:underline flex items-center gap-1">
                        View All <ArrowRight size={12} />
                    </Link>
                </div>

                {tournaments.length === 0 ? (
                    <div className="text-center py-12">
                        <Trophy size={40} className="mx-auto text-slate-600 mb-3" />
                        <p className="text-slate-400 text-sm">No tournaments yet</p>
                        <p className="text-slate-500 text-xs mt-1">Create your first tournament to get started</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {tournaments.slice(0, 5).map((t, i) => (
                            <Link
                                key={t.id}
                                to={`/tournaments/${t.id}`}
                                className={`flex items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-all group animate-fade-in-up delay-${i + 1}`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-400)]/20 to-purple-500/20 flex items-center justify-center">
                                        <Trophy size={16} className="text-[var(--color-accent-400)]" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white group-hover:text-[var(--color-accent-400)] transition-colors">{t.name}</p>
                                        <p className="text-xs text-slate-500">{t.teamCount || 0} teams · {t.matchCount || 0} matches</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${t.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' :
                                            t.status === 'completed' ? 'bg-slate-400/10 text-slate-400' :
                                                'bg-amber-400/10 text-amber-400'
                                        }`}>
                                        {t.status || 'upcoming'}
                                    </span>
                                    <ArrowRight size={14} className="text-slate-600 group-hover:text-[var(--color-accent-400)] transition-colors" />
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
