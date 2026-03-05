import {
    collection, doc, addDoc, getDocs, updateDoc, deleteDoc,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

function teamsCol(tournamentId) {
    return collection(db, 'tournaments', tournamentId, 'teams');
}

function teamDoc(tournamentId, teamId) {
    return doc(db, 'tournaments', tournamentId, 'teams', teamId);
}

export async function addTeam(tournamentId, data) {
    const docRef = await addDoc(teamsCol(tournamentId), {
        name: data.name,
        logo: data.logo || '',
        matches: 0,
        wins: 0,
        draws: 0,
        losses: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
        points: 0,
        createdAt: serverTimestamp(),
    });
    // Update team count
    const { updateTournament } = await import('./tournamentService');
    const teams = await getTeams(tournamentId);
    await updateTournament(tournamentId, { teamCount: teams.length });
    return docRef.id;
}

export async function getTeams(tournamentId) {
    const snap = await getDocs(teamsCol(tournamentId));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateTeam(tournamentId, teamId, data) {
    await updateDoc(teamDoc(tournamentId, teamId), data);
}

export async function deleteTeam(tournamentId, teamId) {
    await deleteDoc(teamDoc(tournamentId, teamId));
    const { updateTournament } = await import('./tournamentService');
    const teams = await getTeams(tournamentId);
    await updateTournament(tournamentId, { teamCount: teams.length });
}
