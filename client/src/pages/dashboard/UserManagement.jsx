import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Trash2, UserPlus, ShieldAlert, X } from 'lucide-react';

const UserManagement = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [newUser, setNewUser] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        department: '',
        year: ''
    });

    const fetchUsers = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/users`, config);
            setUsers(data);
        } catch (error) {
            console.error('Error fetching users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user?.role === 'admin' || user?.role === 'ceo') {
            fetchUsers();
        }
    }, [user]);

    const handleAddUser = async (e) => {
        e.preventDefault();
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.post(`${import.meta.env.VITE_API_URL}/api/users`, newUser, config);
            setShowModal(false);
            setNewUser({ name: '', email: '', password: '', role: 'student', department: '', year: '' });
            fetchUsers();
            alert('User added successfully');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed to add user');
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/users/${id}`, config);
            fetchUsers();
        } catch (error) {
            alert('Failed to delete user');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in relative">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold dark:text-white">User Management</h1>
                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
                >
                    <UserPlus className="w-5 h-5" />
                    Add User
                </button>
            </div>

            {user?.role === 'ceo' && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 rounded-xl flex items-start gap-3">
                    <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400 mt-1" />
                    <div>
                        <h3 className="font-semibold text-red-900 dark:text-red-300">CEO Access Level</h3>
                        <p className="text-sm text-red-700 dark:text-red-400">You are viewing raw user data. Handle with care.</p>
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-gray-700 dark:text-gray-300 uppercase bg-gray-50 dark:bg-gray-700">
                            <tr>
                                <th className="px-6 py-4">Name</th>
                                <th className="px-6 py-4">Email</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            {users.map((u) => (
                                <tr key={u._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white flex items-center gap-3">
                                        <div className="h-8 w-8 bg-gray-100 dark:bg-gray-600 rounded-full flex items-center justify-center text-xs font-bold text-gray-600 dark:text-gray-300">
                                            {u.name[0]}
                                        </div>
                                        {u.name}
                                    </td>
                                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{u.email}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize
                                            ${u.role === 'admin' || u.role === 'ceo' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' :
                                                u.role === 'teacher' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                                                    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => deleteUser(u._id)}
                                            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {users.length === 0 && !loading && (
                        <div className="text-center py-8 text-gray-500 dark:text-gray-400">No users found.</div>
                    )}
                </div>
            </div>

            {/* Add User Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl animate-fade-in border border-gray-100 dark:border-gray-700">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                            <h2 className="text-xl font-bold dark:text-white">Add New User</h2>
                            <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
                                <input
                                    type="text"
                                    required
                                    className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newUser.email}
                                    onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newUser.password}
                                    onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                                <select
                                    className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                                >
                                    <option value="student">Student</option>
                                    <option value="teacher">Teacher</option>
                                    <option value="admin">Admin</option>
                                    {user?.role === 'ceo' && <option value="ceo">CEO</option>}
                                </select>
                            </div>
                            {newUser.role === 'student' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Department</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={newUser.department}
                                            onChange={e => setNewUser({ ...newUser, department: e.target.value })}
                                            placeholder="CSE"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Year</label>
                                        <input
                                            type="text"
                                            className="w-full p-2.5 rounded-xl border dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                            value={newUser.year}
                                            onChange={e => setNewUser({ ...newUser, year: e.target.value })}
                                            placeholder="3rd"
                                        />
                                    </div>
                                </div>
                            )}
                            <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-xl mt-2">
                                Create User
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
