import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, Edit, Calendar, Filter, Search } from 'lucide-react';
import { getMatches, addMatch, updateMatch, deleteMatch } from '../services/matchService';
import { getTeams } from '../services/teamService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

const ROUNDS = ['Group Stage', 'Quarter Final', 'Semi Final', 'Final'];

export default function Matches() {
    const { tournamentId } = useParams();
    const { role } = useAuth();
    const addToastMsg = useToast();
    const [matches, setMatches] = useState([]);
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [filterTeam, setFilterTeam] = useState('all');
    const [filterRound, setFilterRound] = useState('all');
    const [form, setForm] = useState({
        teamA: '', teamB: '', goalsA: '', goalsB: '', round: 'Group Stage', date: ''
    });

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

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.teamA || !form.teamB || form.teamA === form.teamB) {
            addToastMsg('Select two different teams', 'error');
            return;
        }
        const teamAObj = teams.find(t => t.id === form.teamA);
        const teamBObj = teams.find(t => t.id === form.teamB);
        const data = {
            teamA: form.teamA,
            teamB: form.teamB,
            teamAName: teamAObj?.name || form.teamA,
            teamBName: teamBObj?.name || form.teamB,
            goalsA: form.goalsA !== '' ? Number(form.goalsA) : null,
            goalsB: form.goalsB !== '' ? Number(form.goalsB) : null,
            round: form.round,
            date: form.date || null,
        };
        try {
            if (editing) {
                await updateMatch(tournamentId, editing.id, data);
                addToastMsg('Match updated');
            } else {
                await addMatch(tournamentId, data);
                addToastMsg('Match added');
            }
            setShowModal(false);
            setEditing(null);
            resetForm();
            loadData();
        } catch (e) {
            addToastMsg(e.message, 'error');
        }
    }

    async function handleDelete(matchId) {
        if (!confirm('Delete this match?')) return;
        try {
            await deleteMatch(tournamentId, matchId);
            addToastMsg('Match deleted');
            loadData();
        } catch (e) {
            addToastMsg(e.message, 'error');
        }
    }

    function resetForm() {
        setForm({ teamA: '', teamB: '', goalsA: '', goalsB: '', round: 'Group Stage', date: '' });
    }

    function openEdit(m) {
        setEditing(m);
        setForm({
            teamA: m.teamA,
            teamB: m.teamB,
            goalsA: m.goalsA ?? '',
            goalsB: m.goalsB ?? '',
            round: m.round,
            date: m.date || '',
        });
        setShowModal(true);
    }

    const filtered = matches.filter(m => {
        if (filterTeam !== 'all' && m.teamA !== filterTeam && m.teamB !== filterTeam) return false;
        if (filterRound !== 'all' && m.round !== filterRound) return false;
        return true;
    });

    const canManage = role === 'admin' || role === 'organizer';

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-2 border-[var(--color-accent-400)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Matches</h1>
                    <p className="text-slate-400 text-sm mt-1">{matches.length} match{matches.length !== 1 ? 'es' : ''} total</p>
                </div>
                {canManage && (
                    <button
                        onClick={() => { setEditing(null); resetForm(); setShowModal(true); }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-accent-400)] to-blue-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-[var(--color-accent-400)]/20 transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        Add Match
                    </button>
                )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                    <Filter size={14} className="text-slate-500" />
                    <select
                        value={filterTeam}
                        onChange={e => setFilterTeam(e.target.value)}
                        className="px-3 py-2 rounded-xl bg-[var(--color-dark-700)] border border-[var(--color-dark-500)] text-sm text-white focus:outline-none focus:border-[var(--color-accent-400)]"
                    >
                        <option value="all">All Teams</option>
                        {teams.map(t => (
                            <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                    </select>
                </div>
                <select
                    value={filterRound}
                    onChange={e => setFilterRound(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-[var(--color-dark-700)] border border-[var(--color-dark-500)] text-sm text-white focus:outline-none focus:border-[var(--color-accent-400)]"
                >
                    <option value="all">All Rounds</option>
                    {ROUNDS.map(r => (
                        <option key={r} value={r}>{r}</option>
                    ))}
                </select>
            </div>

            {/* Match List grouped by round */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 glass-card">
                    <Calendar size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-lg font-semibold text-slate-400">No matches found</p>
                </div>
            ) : (
                ROUNDS.map(round => {
                    const roundMatches = filtered.filter(m => m.round === round);
                    if (roundMatches.length === 0) return null;
                    return (
                        <div key={round} className="glass-card p-5">
                            <h3 className="text-sm font-bold text-[var(--color-accent-400)] uppercase tracking-wider mb-4">{round}</h3>
                            <div className="space-y-2">
                                {roundMatches.map(m => (
                                    <div key={m.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--color-dark-700)]/50 group hover:bg-[var(--color-dark-600)]/50 transition-all">
                                        {/* Team A */}
                                        <div className="flex-1 text-right">
                                            <span className="text-sm font-semibold text-white">{m.teamAName || m.teamA}</span>
                                        </div>

                                        {/* Score */}
                                        <div className="min-w-[80px] text-center">
                                            {m.status === 'completed' ? (
                                                <span className="text-lg font-bold text-white">{m.goalsA} - {m.goalsB}</span>
                                            ) : (
                                                <span className="text-xs text-slate-500 px-2 py-1 rounded-lg bg-[var(--color-dark-600)]">
                                                    {m.date || 'TBD'}
                                                </span>
                                            )}
                                        </div>

                                        {/* Team B */}
                                        <div className="flex-1">
                                            <span className="text-sm font-semibold text-white">{m.teamBName || m.teamB}</span>
                                        </div>

                                        {/* Actions */}
                                        {canManage && (
                                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => openEdit(m)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 transition-all"
                                                >
                                                    <Edit size={14} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(m.id)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })
            )}

            {/* Add/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditing(null); }}
                title={editing ? 'Edit Match' : 'Schedule Match'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Team A</label>
                            <select
                                value={form.teamA}
                                onChange={e => setForm(prev => ({ ...prev, teamA: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-dark-700)] border border-[var(--color-dark-500)] text-white text-sm focus:outline-none focus:border-[var(--color-accent-400)]"
                                required
                            >
                                <option value="">Select</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Team B</label>
                            <select
                                value={form.teamB}
                                onChange={e => setForm(prev => ({ ...prev, teamB: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-dark-700)] border border-[var(--color-dark-500)] text-white text-sm focus:outline-none focus:border-[var(--color-accent-400)]"
                                required
                            >
                                <option value="">Select</option>
                                {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Goals A</label>
                            <input
                                type="number"
                                min="0"
                                value={form.goalsA}
                                onChange={e => setForm(prev => ({ ...prev, goalsA: e.target.value }))}
                                placeholder="—"
                                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-dark-700)] border border-[var(--color-dark-500)] text-white text-sm focus:outline-none focus:border-[var(--color-accent-400)]"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Goals B</label>
                            <input
                                type="number"
                                min="0"
                                value={form.goalsB}
                                onChange={e => setForm(prev => ({ ...prev, goalsB: e.target.value }))}
                                placeholder="—"
                                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-dark-700)] border border-[var(--color-dark-500)] text-white text-sm focus:outline-none focus:border-[var(--color-accent-400)]"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Round</label>
                            <select
                                value={form.round}
                                onChange={e => setForm(prev => ({ ...prev, round: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-dark-700)] border border-[var(--color-dark-500)] text-white text-sm focus:outline-none focus:border-[var(--color-accent-400)]"
                            >
                                {ROUNDS.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
                            <input
                                type="date"
                                value={form.date}
                                onChange={e => setForm(prev => ({ ...prev, date: e.target.value }))}
                                className="w-full px-3 py-2.5 rounded-xl bg-[var(--color-dark-700)] border border-[var(--color-dark-500)] text-white text-sm focus:outline-none focus:border-[var(--color-accent-400)]"
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => { setShowModal(false); setEditing(null); }}
                            className="flex-1 py-2.5 rounded-xl border border-[var(--color-dark-500)] text-slate-300 text-sm font-medium hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-accent-400)] to-blue-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-[var(--color-accent-400)]/20 transition-all"
                        >
                            {editing ? 'Update' : 'Schedule'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
