import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function ProtectedRoute({ children, allowedRoles }) {
    const { user, role, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-dark-900)]">
                <div className="w-8 h-8 border-2 border-[var(--color-accent-400)] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    if (!user) return <Navigate to="/login" />;

    if (allowedRoles && !allowedRoles.includes(role)) {
        return <Navigate to="/" />;
    }

    return children;
}
