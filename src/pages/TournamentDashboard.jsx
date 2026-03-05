import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, Users, Calendar, BarChart3, GitBranch, ArrowRight, ExternalLink, Settings, Copy, Check } from 'lucide-react';
import { getTournament, updateTournament } from '../services/tournamentService';
import { getTeams } from '../services/teamService';
import { getMatches } from '../services/matchService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';

export default function TournamentDashboard() {
    const { tournamentId } = useParams();
    const { role } = useAuth();
    const addToast = useToast();
    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => { loadData(); }, [tournamentId]);

    async function loadData() {
        try {
            const [t, te, m] = await Promise.all([
                getTournament(tournamentId),
                getTeams(tournamentId),
                getMatches(tournamentId),
            ]);
            setTournament(t);
            setTeams(te);
            setMatches(m);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    async function handleStatusChange(status) {
        await updateTournament(tournamentId, { status });
        setTournament(prev => ({ ...prev, status }));
        addToast(`Tournament marked as ${status}`);
    }

    function copyLink() {
        const url = `${window.location.origin}/t/${tournament.slug}`;
        navigator.clipboard.writeText(url);
        setCopied(true);
        addToast('Link copied to clipboard');
        setTimeout(() => setCopied(false), 2000);
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[var(--color-accent-400)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="text-center py-20">
                <p className="text-slate-400">Tournament not found</p>
            </div>
        );
    }

    const completedMatches = matches.filter(m => m.status === 'completed').length;
    const canManage = role === 'admin' || role === 'organizer';

    const quickLinks = [
        { to: `/tournaments/${tournamentId}/teams`, icon: Users, label: 'Teams', desc: `${teams.length} teams`, color: 'from-blue-400 to-blue-600' },
        { to: `/tournaments/${tournamentId}/matches`, icon: Calendar, label: 'Matches', desc: `${matches.length} scheduled`, color: 'from-purple-400 to-purple-600' },
        { to: `/tournaments/${tournamentId}/standings`, icon: BarChart3, label: 'Standings', desc: 'Points table', color: 'from-emerald-400 to-emerald-600' },
        { to: `/tournaments/${tournamentId}/bracket`, icon: GitBranch, label: 'Bracket', desc: 'Knockout stage', color: 'from-amber-400 to-orange-500' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Tournament Header */}
            <div className="glass-card overflow-hidden">
                <div className="h-28 bg-gradient-to-br from-[var(--color-accent-400)]/20 via-purple-500/10 to-[var(--color-dark-700)] relative">
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark-800)]" />
                </div>
                <div className="px-5 pb-5 -mt-8 relative">
                    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
                        <div className="flex items-end gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-accent-400)] to-blue-500 flex items-center justify-center shadow-lg shadow-[var(--color-accent-400)]/20 ring-4 ring-[var(--color-dark-800)]">
                                <Trophy size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">{tournament.name}</h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-slate-400 capitalize">{tournament.type || 'league'}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${tournament.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' :
                                            tournament.status === 'completed' ? 'bg-slate-400/10 text-slate-400' :
                                                'bg-amber-400/10 text-amber-400'
                                        }`}>
                                        {tournament.status || 'upcoming'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            {tournament.slug && (
                                <button
                                    onClick={copyLink}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-dark-600)] text-sm text-slate-300 hover:text-white transition-all"
                                >
                                    {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                                    Share
                                </button>
                            )}
                            {tournament.slug && (
                                <Link
                                    to={`/t/${tournament.slug}`}
                                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-[var(--color-dark-600)] text-sm text-slate-300 hover:text-white transition-all"
                                >
                                    <ExternalLink size={14} />
                                    Public
                                </Link>
                            )}
                            {canManage && (
                                <select
                                    value={tournament.status || 'upcoming'}
                                    onChange={e => handleStatusChange(e.target.value)}
                                    className="px-3 py-2 rounded-xl bg-[var(--color-dark-600)] border border-[var(--color-dark-500)] text-sm text-slate-300 focus:outline-none"
                                >
                                    <option value="upcoming">Upcoming</option>
                                    <option value="active">Active</option>
                                    <option value="completed">Completed</option>
                                </select>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Teams', value: teams.length, icon: Users },
                    { label: 'Total Matches', value: matches.length, icon: Calendar },
                    { label: 'Completed', value: completedMatches, icon: BarChart3 },
                    { label: 'Remaining', value: matches.length - completedMatches, icon: Trophy },
                ].map((s, i) => (
                    <div key={s.label} className={`glass-card p-4 animate-fade-in-up delay-${i + 1}`}>
                        <s.icon size={18} className="text-[var(--color-accent-400)] mb-2" />
                        <p className="text-xl font-bold text-white">{s.value}</p>
                        <p className="text-xs text-slate-500">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Quick Links */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {quickLinks.map((link, i) => (
                    <Link
                        key={link.label}
                        to={link.to}
                        className={`glass-card p-5 group hover:border-[var(--color-accent-400)]/30 transition-all animate-fade-in-up delay-${i + 1}`}
                    >
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${link.color} flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                            <link.icon size={18} className="text-white" />
                        </div>
                        <p className="text-sm font-semibold text-white group-hover:text-[var(--color-accent-400)] transition-colors">{link.label}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{link.desc}</p>
                        <ArrowRight size={14} className="text-slate-600 mt-2 group-hover:text-[var(--color-accent-400)] group-hover:translate-x-1 transition-all" />
                    </Link>
                ))}
            </div>

            {/* Recent Matches */}
            <div className="glass-card p-5">
                <h3 className="text-base font-bold text-white mb-4">Recent Results</h3>
                {matches.filter(m => m.status === 'completed').length === 0 ? (
                    <p className="text-slate-500 text-sm text-center py-6">No completed matches yet</p>
                ) : (
                    <div className="space-y-2">
                        {matches.filter(m => m.status === 'completed').slice(-5).reverse().map(m => (
                            <div key={m.id} className="flex items-center justify-between p-3 rounded-xl bg-[var(--color-dark-700)]/50">
                                <div className="flex items-center gap-2 flex-1 justify-end text-right">
                                    <span className="text-sm font-semibold text-white">{m.teamAName || m.teamA}</span>
                                </div>
                                <div className="px-4 text-center min-w-[80px]">
                                    <span className="text-lg font-bold text-white">{m.goalsA} - {m.goalsB}</span>
                                    <p className="text-[10px] text-slate-500 mt-0.5">{m.round}</p>
                                </div>
                                <div className="flex items-center gap-2 flex-1">
                                    <span className="text-sm font-semibold text-white">{m.teamBName || m.teamB}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
