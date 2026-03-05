import {
    collection, doc, addDoc, getDocs, updateDoc, deleteDoc,
    query, orderBy, serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase';

function matchesCol(tournamentId) {
    return collection(db, 'tournaments', tournamentId, 'matches');
}

function matchDoc(tournamentId, matchId) {
    return doc(db, 'tournaments', tournamentId, 'matches', matchId);
}

export async function addMatch(tournamentId, data) {
    const docRef = await addDoc(matchesCol(tournamentId), {
        teamA: data.teamA,
        teamB: data.teamB,
        teamAName: data.teamAName || '',
        teamBName: data.teamBName || '',
        goalsA: data.goalsA ?? null,
        goalsB: data.goalsB ?? null,
        round: data.round,
        date: data.date || null,
        status: data.goalsA !== null ? 'completed' : 'scheduled',
        createdAt: serverTimestamp(),
    });
    if (data.goalsA !== null && data.goalsB !== null) {
        await recalculateStandings(tournamentId);
    }
    // Update match count
    const { updateTournament } = await import('./tournamentService');
    const matches = await getMatches(tournamentId);
    await updateTournament(tournamentId, { matchCount: matches.length });
    return docRef.id;
}

export async function getMatches(tournamentId) {
    const q = query(matchesCol(tournamentId), orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function updateMatch(tournamentId, matchId, data) {
    const updateData = { ...data };
    if (data.goalsA !== null && data.goalsB !== null) {
        updateData.status = 'completed';
    }
    await updateDoc(matchDoc(tournamentId, matchId), updateData);
    await recalculateStandings(tournamentId);
}

export async function deleteMatch(tournamentId, matchId) {
    await deleteDoc(matchDoc(tournamentId, matchId));
    await recalculateStandings(tournamentId);
    const { updateTournament } = await import('./tournamentService');
    const matches = await getMatches(tournamentId);
    await updateTournament(tournamentId, { matchCount: matches.length });
}

export async function recalculateStandings(tournamentId) {
    const { getTeams, updateTeam } = await import('./teamService');
    const teams = await getTeams(tournamentId);
    const matches = await getMatches(tournamentId);

    // Reset all stats
    const stats = {};
    teams.forEach(t => {
        stats[t.id] = {
            matches: 0, wins: 0, draws: 0, losses: 0,
            goalsFor: 0, goalsAgainst: 0, goalDifference: 0, points: 0,
        };
    });

    // Calculate from completed matches
    matches.forEach(m => {
        if (m.status !== 'completed' || m.goalsA === null || m.goalsB === null) return;
        if (!stats[m.teamA] || !stats[m.teamB]) return;

        stats[m.teamA].matches++;
        stats[m.teamB].matches++;
        stats[m.teamA].goalsFor += m.goalsA;
        stats[m.teamA].goalsAgainst += m.goalsB;
        stats[m.teamB].goalsFor += m.goalsB;
        stats[m.teamB].goalsAgainst += m.goalsA;
        stats[m.teamA].goalDifference += (m.goalsA - m.goalsB);
        stats[m.teamB].goalDifference += (m.goalsB - m.goalsA);

        if (m.goalsA > m.goalsB) {
            stats[m.teamA].wins++;
            stats[m.teamA].points += 3;
            stats[m.teamB].losses++;
        } else if (m.goalsB > m.goalsA) {
            stats[m.teamB].wins++;
            stats[m.teamB].points += 3;
            stats[m.teamA].losses++;
        } else {
            stats[m.teamA].draws++;
            stats[m.teamB].draws++;
            stats[m.teamA].points++;
            stats[m.teamB].points++;
        }
    });

    // Update all teams with new stats
    for (const teamId in stats) {
        await updateTeam(tournamentId, teamId, stats[teamId]);
    }
}
