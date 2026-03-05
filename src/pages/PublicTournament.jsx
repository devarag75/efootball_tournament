import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Trophy, BarChart3, Calendar, GitBranch, Share2, Copy, Check, ArrowLeft } from 'lucide-react';
import { getTournamentBySlug } from '../services/tournamentService';
import { getTeams } from '../services/teamService';
import { getMatches } from '../services/matchService';

export default function PublicTournament() {
    const { slug } = useParams();
    const [tournament, setTournament] = useState(null);
    const [teams, setTeams] = useState([]);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [tab, setTab] = useState('standings');
    const [copied, setCopied] = useState(false);

    useEffect(() => { loadData(); }, [slug]);

    async function loadData() {
        try {
            const t = await getTournamentBySlug(slug);
            if (t) {
                setTournament(t);
                const [te, m] = await Promise.all([
                    getTeams(t.id),
                    getMatches(t.id),
                ]);
                te.sort((a, b) =>
                    (b.points || 0) - (a.points || 0) ||
                    (b.goalDifference || 0) - (a.goalDifference || 0) ||
                    (b.goalsFor || 0) - (a.goalsFor || 0)
                );
                setTeams(te);
                setMatches(m);
            }
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    function copyLink() {
        navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }

    function teamName(id) {
        const t = teams.find(t => t.id === id);
        return t?.name || id || 'TBD';
    }

    function getWinner(m) {
        if (m.status !== 'completed') return null;
        if (m.goalsA > m.goalsB) return m.teamA;
        if (m.goalsB > m.goalsA) return m.teamB;
        return null;
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-dark-900)]">
                <div className="w-8 h-8 border-2 border-[var(--color-accent-400)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--color-dark-900)]">
                <Trophy size={48} className="text-slate-600 mb-4" />
                <h1 className="text-xl font-bold text-white mb-2">Tournament Not Found</h1>
                <p className="text-slate-400 text-sm mb-6">This tournament doesn't exist or was removed.</p>
                <Link to="/" className="text-[var(--color-accent-400)] text-sm hover:underline">← Back to Home</Link>
            </div>
        );
    }

    const ROUNDS = ['Group Stage', 'Quarter Final', 'Semi Final', 'Final'];

    const tabs = [
        { id: 'standings', label: 'Standings', icon: BarChart3 },
        { id: 'matches', label: 'Matches', icon: Calendar },
        { id: 'bracket', label: 'Bracket', icon: GitBranch },
    ];

    return (
        <div className="min-h-screen bg-[var(--color-dark-900)]">
            {/* Header */}
            <div className="bg-gradient-to-br from-[var(--color-accent-400)]/10 via-purple-500/5 to-[var(--color-dark-900)] border-b border-[var(--color-dark-600)]">
                <div className="max-w-5xl mx-auto px-4 py-8">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--color-accent-400)] to-blue-500 flex items-center justify-center shadow-lg shadow-[var(--color-accent-400)]/20">
                                <Trophy size={24} className="text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-extrabold text-white">{tournament.name}</h1>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="text-xs text-slate-400 capitalize">{tournament.type || 'league'}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${tournament.status === 'active' ? 'bg-emerald-400/10 text-emerald-400' :
                                            tournament.status === 'completed' ? 'bg-slate-400/10 text-slate-400' :
                                                'bg-amber-400/10 text-amber-400'
                                        }`}>
                                        {tournament.status || 'upcoming'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <button
                            onClick={copyLink}
                            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--color-dark-700)] border border-[var(--color-dark-500)] text-sm text-slate-300 hover:text-white transition-all"
                        >
                            {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                            {copied ? 'Copied!' : 'Share Link'}
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-1 mt-6">
                        {tabs.map(t => (
                            <button
                                key={t.id}
                                onClick={() => setTab(t.id)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === t.id
                                        ? 'bg-[var(--color-accent-400)]/10 text-[var(--color-accent-400)]'
                                        : 'text-slate-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <t.icon size={16} />
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 py-6">
                {/* Standings Tab */}
                {tab === 'standings' && (
                    <div className="glass-card overflow-hidden animate-fade-in">
                        <div className="overflow-x-auto">
                            <table className="w-full standings-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th className="text-left">Team</th>
                                        <th>M</th><th>W</th><th>D</th><th>L</th>
                                        <th>GF</th><th>GA</th><th>GD</th><th>Pts</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {teams.map((t, i) => (
                                        <tr key={t.id}>
                                            <td>
                                                <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${i === 0 ? 'bg-amber-400/20 text-amber-400' :
                                                        i === 1 ? 'bg-slate-300/20 text-slate-300' :
                                                            i === 2 ? 'bg-orange-400/20 text-orange-400' : 'text-slate-500'
                                                    }`}>{i + 1}</span>
                                            </td>
                                            <td className="text-left font-semibold text-white">{t.name}</td>
                                            <td>{t.matches || 0}</td>
                                            <td className="text-emerald-400 font-semibold">{t.wins || 0}</td>
                                            <td className="text-amber-400">{t.draws || 0}</td>
                                            <td className="text-red-400">{t.losses || 0}</td>
                                            <td>{t.goalsFor || 0}</td>
                                            <td>{t.goalsAgainst || 0}</td>
                                            <td className={`font-semibold ${(t.goalDifference || 0) > 0 ? 'text-emerald-400' : (t.goalDifference || 0) < 0 ? 'text-red-400' : ''}`}>
                                                {(t.goalDifference || 0) > 0 ? '+' : ''}{t.goalDifference || 0}
                                            </td>
                                            <td>
                                                <span className="inline-flex items-center justify-center min-w-[28px] px-2 py-1 rounded-lg bg-[var(--color-accent-400)]/10 text-[var(--color-accent-400)] font-bold">
                                                    {t.points || 0}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {teams.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-slate-500 text-sm">No standings data yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Matches Tab */}
                {tab === 'matches' && (
                    <div className="space-y-4 animate-fade-in">
                        {ROUNDS.map(round => {
                            const rm = matches.filter(m => m.round === round);
                            if (rm.length === 0) return null;
                            return (
                                <div key={round} className="glass-card p-5">
                                    <h3 className="text-xs font-bold text-[var(--color-accent-400)] uppercase tracking-wider mb-4">{round}</h3>
                                    <div className="space-y-2">
                                        {rm.map(m => (
                                            <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-dark-700)]/50">
                                                <div className="flex-1 text-right">
                                                    <span className="text-sm font-semibold text-white">{m.teamAName || teamName(m.teamA)}</span>
                                                </div>
                                                <div className="min-w-[80px] text-center">
                                                    {m.status === 'completed' ? (
                                                        <span className="text-lg font-bold text-white">{m.goalsA} - {m.goalsB}</span>
                                                    ) : (
                                                        <span className="text-xs text-slate-500 px-2 py-1 rounded-lg bg-[var(--color-dark-600)]">
                                                            {m.date || 'TBD'}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex-1">
                                                    <span className="text-sm font-semibold text-white">{m.teamBName || teamName(m.teamB)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {matches.length === 0 && (
                            <div className="text-center py-16 glass-card">
                                <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
                                <p className="text-slate-400">No matches scheduled yet</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Bracket Tab */}
                {tab === 'bracket' && (
                    <div className="overflow-x-auto animate-fade-in">
                        <div className="flex items-start gap-6 min-w-[600px] lg:min-w-0">
                            {['Quarter Final', 'Semi Final', 'Final'].map((round) => {
                                const rm = matches.filter(m => m.round === round);
                                return (
                                    <div key={round} className="flex-1 min-w-[180px]">
                                        <h3 className="text-xs font-bold text-[var(--color-accent-400)] uppercase tracking-wider mb-4 text-center">
                                            {round === 'Final' && '🏆 '}{round}
                                        </h3>
                                        <div className={`flex flex-col gap-4 ${round === 'Semi Final' ? 'justify-around py-4' :
                                                round === 'Final' ? 'justify-center py-8' : ''
                                            }`}>
                                            {rm.length === 0 ? (
                                                <div className="glass-card p-4 text-center">
                                                    <p className="text-xs text-slate-500">No matches</p>
                                                </div>
                                            ) : rm.map(m => {
                                                const winner = getWinner(m);
                                                return (
                                                    <div key={m.id} className={`glass-card overflow-hidden ${round === 'Final' ? 'ring-1 ring-amber-400/20' : ''}`}>
                                                        <div className={`flex items-center justify-between px-3 py-2.5 border-b border-[var(--color-dark-600)] ${winner === m.teamA ? 'bg-emerald-400/5' : ''}`}>
                                                            <span className={`text-sm font-medium ${winner === m.teamA ? 'text-emerald-400' : 'text-white'}`}>{teamName(m.teamA)}</span>
                                                            <span className={`text-sm font-bold ${winner === m.teamA ? 'text-emerald-400' : 'text-slate-500'}`}>{m.goalsA ?? '—'}</span>
                                                        </div>
                                                        <div className={`flex items-center justify-between px-3 py-2.5 ${winner === m.teamB ? 'bg-emerald-400/5' : ''}`}>
                                                            <span className={`text-sm font-medium ${winner === m.teamB ? 'text-emerald-400' : 'text-white'}`}>{teamName(m.teamB)}</span>
                                                            <span className={`text-sm font-bold ${winner === m.teamB ? 'text-emerald-400' : 'text-slate-500'}`}>{m.goalsB ?? '—'}</span>
                                                        </div>
                                                        {round === 'Final' && winner && (
                                                            <div className="px-3 py-1.5 bg-gradient-to-r from-amber-400/10 to-amber-600/10 text-center">
                                                                <span className="text-[10px] font-semibold text-amber-400">🏆 {teamName(winner)}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="text-center py-6 border-t border-[var(--color-dark-600)] mt-8">
                <p className="text-xs text-slate-600">Powered by <span className="text-[var(--color-accent-400)] font-semibold">TournamentOS</span></p>
            </footer>
        </div>
    );
}
