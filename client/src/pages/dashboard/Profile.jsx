import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Phone, MapPin, Shield, Save, Key } from 'lucide-react';
import axios from 'axios';
import IDCard from '../../components/IDCard';

const Profile = () => {
    const { user, login } = useAuth(); // We might need to update user context, for now let's just use it to display
    // Note: Updating context user object is tricky without a dedicated 'updateUser' in context, 
    // but we can just update local state or re-fetch if needed.

    const [formData, setFormData] = useState({
        name: user.name,
        email: user.email,
        phone: user.phone || '',
        address: user.address || '',
        currentPassword: '',
        newPassword: ''
    });

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [showIDCard, setShowIDCard] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };

            // Call backend to update
            const { data } = await axios.put(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
                phone: formData.phone,
                address: formData.address,
                password: formData.newPassword ? formData.newPassword : undefined
                // We don't verify current password for simplicity in this MVP, but usually we should.
            }, config);

            // Update local storage user info roughly (excluding token change)
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            userInfo.phone = data.phone;
            userInfo.address = data.address;
            localStorage.setItem('userInfo', JSON.stringify(userInfo));

            setMessage('Profile updated successfully!');
            // Optional: clear password fields
            setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
        } catch (error) {
            console.error(error);
            setMessage('Failed to update profile.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 animate-fade-in p-4 max-w-4xl mx-auto">
            <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                <User className="h-8 w-8 text-indigo-600" />
                My Profile
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto flex items-center justify-center text-4xl font-bold text-white mb-4 shadow-lg shadow-indigo-500/30">
                            {user.name.charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold dark:text-white">{user.name}</h2>
                        <span className="inline-block bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-3 py-1 rounded-full text-xs font-semibold mt-2 uppercase">
                            {user.role}
                        </span>

                        <div className="mt-4">
                            <button
                                onClick={() => setShowIDCard(true)}
                                className="text-xs bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-500/30 font-bold"
                            >
                                Generate ID Card
                            </button>
                        </div>

                        <div className="mt-6 space-y-3 text-left">
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <Mail className="h-4 w-4" />
                                <span className="truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                                <Shield className="h-4 w-4" />
                                <span>{user.department || 'General'} - {user.year || 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Edit Form */}
                <div className="md:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-8">
                        <h3 className="text-lg font-bold dark:text-white mb-6">Edit Details</h3>

                        {message && (
                            <div className={`p-4 rounded-xl mb-6 text-sm flex items-center gap-2 ${message.includes('success') ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700'}`}>
                                <Shield className="h-4 w-4" />
                                {message}
                            </div>
                        )}

                        <form onSubmit={handleUpdateProfile} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                                    <div className="relative">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-5 w-5" />
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full pl-9 p-2.5 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500/20 outline-none"
                                            placeholder="+91..."
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-3 text-gray-400 h-5 w-5" />
                                        <textarea
                                            name="address"
                                            rows="3"
                                            value={formData.address}
                                            onChange={handleChange}
                                            className="w-full pl-10 p-3 rounded-xl border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                                            placeholder="Hostel Block A, Room 101..."
                                        />
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;
