import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { GitBranch, Trophy } from 'lucide-react';
import { getMatches } from '../services/matchService';
import { getTeams } from '../services/teamService';

export default function Bracket() {
    const { tournamentId } = useParams();
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadData(); }, [tournamentId]);

    async function loadData() {
        try {
            const [m, t] = await Promise.all([
                getMatches(tournamentId),
                getTeams(tournamentId),
            ]);
            setMatches(m);
            setTeams(t);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    const knockoutRounds = ['Quarter Final', 'Semi Final', 'Final'];
    const roundMatches = {};
    knockoutRounds.forEach(r => {
        roundMatches[r] = matches.filter(m => m.round === r);
    });

    // Get team name by id
    function teamName(id) {
        const t = teams.find(t => t.id === id);
        return t?.name || id || 'TBD';
    }

    // Determine winner
    function getWinner(m) {
        if (m.status !== 'completed' || m.goalsA === null) return null;
        if (m.goalsA > m.goalsB) return m.teamA;
        if (m.goalsB > m.goalsA) return m.teamB;
        return null; // draw
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[var(--color-accent-400)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const hasKnockout = knockoutRounds.some(r => roundMatches[r].length > 0);

    return (
        <div className="space-y-6 animate-fade-in">
            <div>
                <h1 className="text-2xl font-bold text-white">Bracket</h1>
                <p className="text-slate-400 text-sm mt-1">Knockout stage visualization</p>
            </div>

            {!hasKnockout ? (
                <div className="text-center py-16 glass-card">
                    <GitBranch size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-lg font-semibold text-slate-400">No knockout matches yet</p>
                    <p className="text-sm text-slate-500 mt-1">Schedule Quarter Final, Semi Final, or Final matches to see the bracket</p>
                </div>
            ) : (
                <div className="overflow-x-auto pb-4">
                    <div className="flex items-start gap-6 min-w-[700px] lg:min-w-0">
                        {knockoutRounds.map((round, roundIdx) => {
                            const rm = roundMatches[round];
                            if (rm.length === 0 && roundIdx > 0) {
                                // Show placeholder slots
                                return (
                                    <div key={round} className="flex-1 min-w-[200px]">
                                        <h3 className="text-xs font-bold text-[var(--color-accent-400)] uppercase tracking-wider mb-4 text-center">{round}</h3>
                                        <div className="flex flex-col justify-around h-full gap-4">
                                            <div className="glass-card p-4 text-center">
                                                <p className="text-xs text-slate-500">Winner advances here</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }
                            return (
                                <div key={round} className="flex-1 min-w-[200px]">
                                    <h3 className="text-xs font-bold text-[var(--color-accent-400)] uppercase tracking-wider mb-4 text-center">
                                        {round === 'Final' && <Trophy size={14} className="inline mr-1 mb-0.5" />}
                                        {round}
                                    </h3>
                                    <div className={`flex flex-col gap-4 ${round === 'Semi Final' ? 'justify-around py-6' :
                                            round === 'Final' ? 'justify-center py-12' : ''
                                        }`}>
                                        {rm.map((m, i) => {
                                            const winner = getWinner(m);
                                            return (
                                                <div key={m.id} className={`glass-card overflow-hidden animate-fade-in-up delay-${Math.min(i + 1, 6)} ${round === 'Final' ? 'ring-1 ring-amber-400/20' : ''
                                                    }`}>
                                                    {/* Team A */}
                                                    <div className={`flex items-center justify-between px-4 py-3 border-b border-[var(--color-dark-600)] ${winner === m.teamA ? 'bg-emerald-400/5' : ''
                                                        }`}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-md bg-[var(--color-dark-600)] flex items-center justify-center text-[10px] font-bold text-[var(--color-accent-400)]">
                                                                {teamName(m.teamA)?.[0]?.toUpperCase()}
                                                            </div>
                                                            <span className={`text-sm font-medium ${winner === m.teamA ? 'text-emerald-400' : 'text-white'}`}>
                                                                {teamName(m.teamA)}
                                                            </span>
                                                        </div>
                                                        <span className={`text-sm font-bold ${m.status === 'completed' ? (winner === m.teamA ? 'text-emerald-400' : 'text-slate-500') : 'text-slate-600'
                                                            }`}>
                                                            {m.goalsA ?? '—'}
                                                        </span>
                                                    </div>
                                                    {/* Team B */}
                                                    <div className={`flex items-center justify-between px-4 py-3 ${winner === m.teamB ? 'bg-emerald-400/5' : ''
                                                        }`}>
                                                        <div className="flex items-center gap-2">
                                                            <div className="w-6 h-6 rounded-md bg-[var(--color-dark-600)] flex items-center justify-center text-[10px] font-bold text-[var(--color-accent-400)]">
                                                                {teamName(m.teamB)?.[0]?.toUpperCase()}
                                                            </div>
                                                            <span className={`text-sm font-medium ${winner === m.teamB ? 'text-emerald-400' : 'text-white'}`}>
                                                                {teamName(m.teamB)}
                                                            </span>
                                                        </div>
                                                        <span className={`text-sm font-bold ${m.status === 'completed' ? (winner === m.teamB ? 'text-emerald-400' : 'text-slate-500') : 'text-slate-600'
                                                            }`}>
                                                            {m.goalsB ?? '—'}
                                                        </span>
                                                    </div>
                                                    {/* Status */}
                                                    {m.status !== 'completed' && (
                                                        <div className="px-4 py-1.5 bg-[var(--color-dark-700)]/50 text-center">
                                                            <span className="text-[10px] text-slate-500">{m.date || 'TBD'}</span>
                                                        </div>
                                                    )}
                                                    {round === 'Final' && winner && (
                                                        <div className="px-4 py-2 bg-gradient-to-r from-amber-400/10 to-amber-600/10 text-center">
                                                            <span className="text-xs font-semibold text-amber-400">🏆 Champion: {teamName(winner)}</span>
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
    );
}
