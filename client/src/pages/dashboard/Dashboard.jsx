import { useAuth } from '../../context/AuthContext';
import StudentDashboard from './StudentDashboard';
import TeacherDashboard from './TeacherDashboard';
import CEODashboard from './CEODashboard';

const Dashboard = () => {
    const { user } = useAuth();

    if (user?.role === 'teacher') {
        return <TeacherDashboard />;
    }

    if (user?.role === 'admin' || user?.role === 'ceo') {
        return <CEODashboard />;
    }

    return <StudentDashboard />;
};

export default Dashboard;
