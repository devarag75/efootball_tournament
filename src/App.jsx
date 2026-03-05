import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Tournaments from './pages/Tournaments';
import TournamentDashboard from './pages/TournamentDashboard';
import Teams from './pages/Teams';
import Matches from './pages/Matches';
import Standings from './pages/Standings';
import Bracket from './pages/Bracket';
import PublicTournament from './pages/PublicTournament';

export default function App() {
    return (
        <ToastProvider>
            <Routes>
                {/* Public routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/t/:slug" element={<PublicTournament />} />

                {/* Protected routes inside layout */}
                <Route element={
                    <ProtectedRoute>
                        <Layout />
                    </ProtectedRoute>
                }>
                    <Route index element={<Dashboard />} />
                    <Route path="tournaments" element={<Tournaments />} />
                    <Route path="tournaments/:tournamentId" element={<TournamentDashboard />} />
                    <Route path="tournaments/:tournamentId/teams" element={<Teams />} />
                    <Route path="tournaments/:tournamentId/matches" element={<Matches />} />
                    <Route path="tournaments/:tournamentId/standings" element={<Standings />} />
                    <Route path="tournaments/:tournamentId/bracket" element={<Bracket />} />
                </Route>
            </Routes>
        </ToastProvider>
    );
}
