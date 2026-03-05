import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Plus, Search, Trash2, Edit, Calendar, Users, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getTournaments, createTournament, deleteTournament, updateTournament } from '../services/tournamentService';
import { useToast } from '../components/Toast';
import Modal from '../components/Modal';

export default function Tournaments() {
    const { user, role } = useAuth();
    const addToast = useToast();
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingTournament, setEditingTournament] = useState(null);
    const [form, setForm] = useState({ name: '', type: 'league' });

    useEffect(() => { loadData(); }, []);

    async function loadData() {
        try {
            const data = await getTournaments();
            setTournaments(data);
        } catch (e) {
            console.error(e);
        }
        setLoading(false);
    }

    async function handleSubmit(e) {
        e.preventDefault();
        if (!form.name.trim()) return;
        try {
            if (editingTournament) {
                await updateTournament(editingTournament.id, { name: form.name, type: form.type });
                addToast('Tournament updated successfully');
            } else {
                await createTournament(form, user.uid);
                addToast('Tournament created successfully');
            }
            setShowModal(false);
            setEditingTournament(null);
            setForm({ name: '', type: 'league' });
            loadData();
        } catch (e) {
            addToast(e.message, 'error');
        }
    }

    async function handleDelete(id) {
        if (!confirm('Delete this tournament and all its data?')) return;
        try {
            await deleteTournament(id);
            addToast('Tournament deleted');
            loadData();
        } catch (e) {
            addToast(e.message, 'error');
        }
    }

    function openEdit(t) {
        setEditingTournament(t);
        setForm({ name: t.name, type: t.type || 'league' });
        setShowModal(true);
    }

    const filtered = tournaments.filter(t =>
        t.name?.toLowerCase().includes(search.toLowerCase())
    );

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
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Tournaments</h1>
                    <p className="text-slate-400 text-sm mt-1">{tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''} total</p>
                </div>
                {canManage && (
                    <button
                        onClick={() => { setEditingTournament(null); setForm({ name: '', type: 'league' }); setShowModal(true); }}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-accent-400)] to-blue-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-[var(--color-accent-400)]/20 transition-all active:scale-95"
                    >
                        <Plus size={16} />
                        Create Tournament
                    </button>
                )}
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                    type="text"
                    placeholder="Search tournaments..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[var(--color-dark-700)] border border-[var(--color-dark-500)] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[var(--color-accent-400)] transition-colors"
                />
            </div>

            {/* Grid */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 glass-card">
                    <Trophy size={48} className="mx-auto text-slate-600 mb-4" />
                    <p className="text-lg font-semibold text-slate-400">No tournaments found</p>
                    <p className="text-sm text-slate-500 mt-1">{search ? 'Try a different search' : 'Create your first tournament to get started'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {filtered.map((t, i) => (
                        <div key={t.id} className={`glass-card overflow-hidden group animate-fade-in-up delay-${Math.min(i + 1, 6)}`}>
                            {/* Banner */}
                            <div className="h-24 bg-gradient-to-br from-[var(--color-accent-400)]/20 via-purple-500/10 to-[var(--color-dark-700)] relative">
                                <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-dark-800)] via-transparent" />
                                <div className="absolute bottom-3 left-4">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--color-accent-400)] to-blue-500 flex items-center justify-center shadow-lg">
                                        <Trophy size={18} className="text-white" />
                                    </div>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${t.status === 'active' ? 'bg-emerald-400/20 text-emerald-400' :
                                            t.status === 'completed' ? 'bg-slate-400/20 text-slate-400' :
                                                'bg-amber-400/20 text-amber-400'
                                        }`}>
                                        {t.status || 'upcoming'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-4">
                                <Link to={`/tournaments/${t.id}`} className="text-base font-bold text-white hover:text-[var(--color-accent-400)] transition-colors">
                                    {t.name}
                                </Link>
                                <p className="text-xs text-slate-500 mt-1 capitalize">{t.type || 'league'} tournament</p>

                                <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
                                    <span className="flex items-center gap-1"><Users size={12} /> {t.teamCount || 0} teams</span>
                                    <span className="flex items-center gap-1"><Calendar size={12} /> {t.matchCount || 0} matches</span>
                                </div>

                                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[var(--color-dark-600)]">
                                    <Link
                                        to={`/tournaments/${t.id}`}
                                        className="flex-1 text-center py-2 rounded-lg bg-[var(--color-accent-400)]/10 text-[var(--color-accent-400)] text-xs font-semibold hover:bg-[var(--color-accent-400)]/20 transition-all"
                                    >
                                        Open
                                    </Link>
                                    {t.slug && (
                                        <Link
                                            to={`/t/${t.slug}`}
                                            className="p-2 rounded-lg bg-[var(--color-dark-600)] text-slate-400 hover:text-white transition-all"
                                            title="Public link"
                                        >
                                            <ExternalLink size={14} />
                                        </Link>
                                    )}
                                    {canManage && (
                                        <>
                                            <button
                                                onClick={() => openEdit(t)}
                                                className="p-2 rounded-lg bg-[var(--color-dark-600)] text-slate-400 hover:text-amber-400 transition-all"
                                            >
                                                <Edit size={14} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(t.id)}
                                                className="p-2 rounded-lg bg-[var(--color-dark-600)] text-slate-400 hover:text-red-400 transition-all"
                                            >
                                                <Trash2 size={14} />
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            <Modal
                isOpen={showModal}
                onClose={() => { setShowModal(false); setEditingTournament(null); }}
                title={editingTournament ? 'Edit Tournament' : 'Create Tournament'}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Tournament Name</label>
                        <input
                            type="text"
                            value={form.name}
                            onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Arjun Cup 2026"
                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-dark-700)] border border-[var(--color-dark-500)] text-white text-sm placeholder-slate-500 focus:outline-none focus:border-[var(--color-accent-400)] transition-colors"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5">Tournament Type</label>
                        <select
                            value={form.type}
                            onChange={e => setForm(prev => ({ ...prev, type: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl bg-[var(--color-dark-700)] border border-[var(--color-dark-500)] text-white text-sm focus:outline-none focus:border-[var(--color-accent-400)] transition-colors"
                        >
                            <option value="league">League</option>
                            <option value="knockout">Knockout</option>
                            <option value="hybrid">Hybrid (Group + Knockout)</option>
                        </select>
                    </div>
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={() => { setShowModal(false); setEditingTournament(null); }}
                            className="flex-1 py-2.5 rounded-xl border border-[var(--color-dark-500)] text-slate-300 text-sm font-medium hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[var(--color-accent-400)] to-blue-500 text-white text-sm font-semibold hover:shadow-lg hover:shadow-[var(--color-accent-400)]/20 transition-all"
                        >
                            {editingTournament ? 'Save Changes' : 'Create'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
