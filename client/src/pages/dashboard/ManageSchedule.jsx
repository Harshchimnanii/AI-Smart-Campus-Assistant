import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Calendar, Clock, MapPin, Plus, Trash2, Repeat, CalendarDays } from 'lucide-react';

const ManageSchedule = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('weekly'); // 'weekly' or 'specific'
    const [schedule, setSchedule] = useState([]);
    const [mappedClasses, setMappedClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [selectedClassId, setSelectedClassId] = useState('');
    const [day, setDay] = useState('Monday');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [room, setRoom] = useState('');

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };

            // Fetch Mapped Classes (for dropdown)
            const classesRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/class-map/my-classes`, config);
            setMappedClasses(classesRes.data);

            // Fetch My Schedule
            const scheduleRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/timetable/my-schedule`, config);
            setSchedule(scheduleRes.data);

            setLoading(false);
        } catch (error) {
            console.error("Error fetching data:", error);
            setLoading(false);
        }
    };

    const handleAdd = async (e) => {
        e.preventDefault();

        if (!selectedClassId) return alert("Select a class");
        const cls = mappedClasses.find(c => c._id === selectedClassId);
        if (!cls) return;

        // If specific, need date. If weekly, need day.
        if (activeTab === 'specific' && !date) return alert("Select a date");

        // Automatically determine day from date for specific
        let finalDay = day;
        if (activeTab === 'specific') {
            const d = new Date(date);
            finalDay = days[d.getDay() === 0 ? 6 : d.getDay() - 1]; // Adjust JS getDay (Sun=0) to our array
        }

        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                department: cls.department,
                year: cls.year,
                subject: cls.subject,
                day: finalDay,
                startTime,
                endTime,
                room,
                type: activeTab,
                date: activeTab === 'specific' ? date : undefined
            };

            const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/api/timetable/add`, payload, config);
            setSchedule([...schedule, data]);
            alert("Class Scheduled!");
        } catch (error) {
            console.error(error);
            alert("Error adding class");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Remove this class?")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`${import.meta.env.VITE_API_URL}/api/timetable/${id}`, config);
            setSchedule(schedule.filter(s => s._id !== id));
        } catch (error) {
            alert("Error removing class");
        }
    };

    const filteredSchedule = schedule.filter(s => s.type === activeTab);

    return (
        <div className="space-y-6 animate-fade-in p-2 md:p-6">
            <h1 className="text-3xl font-bold dark:text-white flex items-center gap-3">
                <Calendar className="h-8 w-8 text-indigo-600" />
                Class Schedule
            </h1>
            <p className="text-gray-500 dark:text-gray-400">Set the Day, Time, and Room for your classes.</p>

            {/* Tabs */}
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl w-fit">
                <button
                    onClick={() => setActiveTab('weekly')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'weekly' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <Repeat className="h-4 w-4" /> Weekly (Permanent)
                </button>
                <button
                    onClick={() => setActiveTab('specific')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all ${activeTab === 'specific' ? 'bg-white dark:bg-gray-700 shadow text-indigo-600 dark:text-white' : 'text-gray-500 dark:text-gray-400'}`}
                >
                    <CalendarDays className="h-4 w-4" /> Date Specific (Extra)
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Form */}
                <div className="lg:col-span-1">
                    <form onSubmit={handleAdd} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-4">
                        <h3 className="font-bold dark:text-white">Add {activeTab === 'weekly' ? 'Weekly' : 'Extra'} Class</h3>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                            <select
                                value={selectedClassId} onChange={e => setSelectedClassId(e.target.value)}
                                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                required
                            >
                                <option value="">Select Class</option>
                                {mappedClasses.map(c => (
                                    <option key={c._id} value={c._id}>{c.subject} ({c.department}-{c.year})</option>
                                ))}
                            </select>
                        </div>

                        {activeTab === 'weekly' ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day</label>
                                <select
                                    value={day} onChange={e => setDay(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                >
                                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                                </select>
                            </div>
                        ) : (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                                <input
                                    type="date"
                                    value={date} onChange={e => setDate(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Start Time</label>
                                <input
                                    type="time"
                                    value={startTime} onChange={e => setStartTime(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">End Time</label>
                                <input
                                    type="time"
                                    value={endTime} onChange={e => setEndTime(e.target.value)}
                                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room No.</label>
                            <input
                                type="text"
                                value={room} onChange={e => setRoom(e.target.value)}
                                placeholder="e.g. 101, LT-2"
                                className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                required
                            />
                        </div>

                        <button type="submit" className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2.5 rounded-xl hover:bg-indigo-700 transition">
                            <Plus className="h-5 w-5" /> Schedule Class
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="lg:col-span-2">
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                            <h3 className="text-lg font-semibold dark:text-white">Current Schedule ({activeTab})</h3>
                        </div>
                        <div className="divide-y divide-gray-100 dark:divide-gray-700">
                            {filteredSchedule.length === 0 ? (
                                <div className="p-8 text-center text-gray-500">No classes scheduled.</div>
                            ) : (
                                filteredSchedule.map(s => (
                                    <div key={s._id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                        <div className="flex items-start gap-4">
                                            <div className="p-3 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-lg font-bold">
                                                {s.subject.charAt(0)}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 dark:text-white">{s.subject}</h4>
                                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                                    {s.type === 'weekly' ? s.day : new Date(s.date).toLocaleDateString()} • {s.startTime} - {s.endTime}
                                                </p>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                                                    <span className="bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">{s.department}-{s.year}</span>
                                                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {s.room}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => handleDelete(s._id)} className="text-red-500 hover:bg-red-50 p-2 rounded-lg">
                                            <Trash2 className="h-5 w-5" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ManageSchedule;
