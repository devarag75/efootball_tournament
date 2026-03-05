import { doc, getDoc, setDoc, getDocs, updateDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export async function getUser(uid) {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
}

export async function createUser(uid, data) {
    await setDoc(doc(db, 'users', uid), {
        ...data,
        createdAt: serverTimestamp(),
    });
}

export async function updateUserRole(uid, role) {
    await updateDoc(doc(db, 'users', uid), { role });
}

export async function listUsers() {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}
