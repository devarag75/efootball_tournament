import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Plus, Trash2, Edit, Users as UsersIcon, X } from 'lucide-react';
import { getTeams, addTeam, updateTeam, deleteTeam } from '../services/teamService';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

export default function Teams() {
    const { tournamentId } = useParams();
    const { role } = useAuth();
    const addToastMsg = useToast();
    const [teams, setTeams] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState({ name: '', logo: '' });

    useEffect(() => { loadData(); }, [tournamentId]);

    async function loadData() {
        try {
            const data = await getTeams(tournamentId);
            setTeams(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name.trim()) return;
        try {
            if (editing) {
                await updateTeam(tournamentId, editing.id, { name: form.name, logo: form.logo });
                addToastMsg('Team updated');
            } else {
                await addTeam(tournamentId, form);
                addToastMsg('Team added');
            }
            setShowModal(false);
            setEditing(null);
            setForm({ name: '', logo: '' });
            loadData();
        } catch (e) {
            addToastMsg(e.message, 'error');
        }
    }

    async function handleDelete(teamId) {
        if (!confirm('Delete this team?')) return;
        try {
            await deleteTeam(tournamentId, teamId);
            addToastMsg('Team deleted');
            loadData();
        } catch (e) {
            addToastMsg(e.message, 'error');
        }
    }

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
                    <h1 className="text-2xl font-bold text-white">Teams</h1>
                    <p className="text-slate-400 text-sm mt-1">{teams.length} team{teams.length !== 1 ? 's' : ''} registered</p>
                </div>
                {canManage && (
                    <button
                        onClick={() => { setEditing(null); setForm({ name: '', logo: '' }); setShowModal(true); }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-accent-400)] to-blue-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-[var(--color-accent-400)]/20 transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        Add Team
                    </button>
                )}
            </div>

            {teams.length === 0 ? (
                <div className="text-center py-16 glass-card">
                    <UsersIcon size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-lg font-semibold text-slate-400">No teams yet</p>
                    <p className="text-sm text-slate-500 mt-1">Add teams to start managing this tournament</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {teams.map((t, i) => (
                        <div key={t.id} className={`glass-card p-5 group animate-fade-in-up delay-${Math.min(i + 1, 6)}`}>
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[var(--color-accent-400)]/20 to-purple-500/20 flex items-center justify-center text-lg font-bold text-[var(--color-accent-400)]">
                                    {t.logo ? (
                                        <img src={t.logo} alt={t.name} className="w-full h-full object-cover rounded-xl" />
                                    ) : (
                                        t.name?.[0]?.toUpperCase() || '?'
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-white truncate">{t.name}</p>
                                    <p className="text-xs text-slate-500">{t.matches || 0} matches</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-4 gap-2 text-center">
                                {[
                                    { label: 'W', value: t.wins || 0, color: 'text-emerald-400' },
                                    { label: 'D', value: t.draws || 0, color: 'text-amber-400' },
                                    { label: 'L', value: t.losses || 0, color: 'text-red-400' },
                                    { label: 'Pts', value: t.points || 0, color: 'text-[var(--color-accent-400)]' },
                                ].map(s => (
                                    <div key={s.label} className="p-2 rounded-lg bg-[var(--color-dark-700)]/50">
                                        <p className={`text-base font-bold ${s.color}`}>{s.value}</p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">{s.label}</p>
                                    </div>
                                ))}
                            </div>

                            {canManage && (
                                <div className="flex gap-2 mt-4 pt-3 border-t border-[var(--color-dark-600)]">
                                    <button
                                        onClick={() => { setEditing(t); setForm({ name: t.name, logo: t.logo || '' }); setShowModal(true); }}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-amber-400 hover:bg-amber-400/5 transition-all"
                                    >
                                        <Edit size={12} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(t.id)}
                                        className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all"
                                    >
                                        <Trash2 size={12} /> Delete
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditing(null); }}
                title={editing ? 'Edit Team' : 'Add Team'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Team Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Manchester City"
                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-dark-700)] border border-[var(--color-dark-500)] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[var(--color-accent-400)] transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Logo URL (optional)</label>
                        <input
                            type="url"
                            value={form.logo}
                            onChange={e => setForm(prev => ({ ...prev, logo: e.target.value }))}
                            placeholder="https://..."
                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-dark-700)] border border-[var(--color-dark-500)] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[var(--color-accent-400)] transition-colors"
                        />
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
                            {editing ? 'Save' : 'Add Team'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
