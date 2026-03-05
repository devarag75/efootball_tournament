import {
    collection, doc, addDoc, getDoc, getDocs, updateDoc, deleteDoc,
    query, orderBy, where, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

const COLLECTION = 'tournaments';

function generateSlug(name) {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
}

export async function createTournament(data, userId) {
    const slug = generateSlug(data.name) + '-' + Date.now().toString(36);
    const docRef = await addDoc(collection(db, COLLECTION), {
        ...data,
        slug,
        status: 'upcoming',
        createdBy: userId,
        createdAt: serverTimestamp(),
        teamCount: 0,
        matchCount: 0,
    });
    return { id: docRef.id, slug };
}

export async function getTournaments() {
    const q = query(collection(db, COLLECTION), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getTournament(id) {
    const snap = await getDoc(doc(db, COLLECTION, id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
}

export async function getTournamentBySlug(slug) {
    const q = query(collection(db, COLLECTION), where('slug', '==', slug));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
}

export async function updateTournament(id, data) {
    await updateDoc(doc(db, COLLECTION, id), data);
}

export async function deleteTournament(id) {
    // Delete subcollections first
    const teamsSnap = await getDocs(collection(db, COLLECTION, id, 'teams'));
    for (const t of teamsSnap.docs) {
        await deleteDoc(doc(db, COLLECTION, id, 'teams', t.id));
    }
    const matchesSnap = await getDocs(collection(db, COLLECTION, id, 'matches'));
    for (const m of matchesSnap.docs) {
        await deleteDoc(doc(db, COLLECTION, id, 'matches', m.id));
    }
    await deleteDoc(doc(db, COLLECTION, id));
}
