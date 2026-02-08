import { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Clock, MapPin, BookOpen } from 'lucide-react';

const Academics = () => {
    const [timetable, setTimetable] = useState({ weekly: [], specific: [] });
    const [loading, setLoading] = useState(true);
    const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));

    const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    useEffect(() => {
        fetchTimetable();
    }, []);

    const fetchTimetable = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/timetable`, config);
            setTimetable(data); // Expecting { weekly: [], specific: [] }
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    // Filter Weekly classes for selected day
    const weeklyClasses = timetable.weekly ? timetable.weekly.filter(t => t.day === selectedDay) : [];

    // Filter Specific classes (Only show if they are for 'Today' and today matches selectedDay, or maybe just list them separately?)
    // For this view (Weekly Schedule), displaying specific dates is tricky unless we toggle to "Calendar View".
    // Let's just show Weekly classes here for the "Standard Schedule" view.
    // BUT, if the user has specific classes upcoming, maybe warn them?
    // Let's stick to Weekly for the tabs, as that's the "Timetable".
    // Specific classes are better suited for a "Dashboard" view or a specific "Calendar" view.

    // However, if there are specific classes for TODAY, they should appear if today is selected.
    const today = new Date();
    const todayName = today.toLocaleDateString('en-US', { weekday: 'long' });

    let displayClasses = [...weeklyClasses];

    if (selectedDay === todayName) {
        const specificForToday = timetable.specific ? timetable.specific.filter(t => {
            const d = new Date(t.date);
            return d.getDate() === today.getDate() && d.getMonth() === today.getMonth();
        }) : [];
        displayClasses = [...displayClasses, ...specificForToday];
    }

    // Sort by time
    displayClasses.sort((a, b) => a.startTime.localeCompare(b.startTime));

    if (loading) return <div className="p-8 dark:text-white">Loading schedule...</div>;

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                        <BookOpen className="h-6 w-6 text-indigo-600" />
                        Academic Schedule
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">Manage your classes and exams</p>
                </div>

                <div className="flex gap-2 overflow-x-auto pb-2">
                    {days.map(day => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors whitespace-nowrap ${selectedDay === day
                                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-none'
                                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-100 dark:border-gray-700'
                                }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-lg font-bold dark:text-white">{selectedDay}'s Classes</h2>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {displayClasses.length > 0 ? displayClasses.map((cls, index) => (
                        <div key={index} className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                            <div className="flex items-start gap-4">
                                <div className="h-12 w-12 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-lg shrink-0">
                                    {cls.subject.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white text-lg">{cls.subject}</h3>
                                    <p className="text-gray-500 dark:text-gray-400 text-sm">{cls.faculty}</p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-4 text-sm text-gray-600 dark:text-gray-300">
                                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                                    <Clock className="h-4 w-4 text-indigo-500" />
                                    {cls.startTime} - {cls.endTime}
                                </div>
                                <div className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-700 px-3 py-1.5 rounded-lg">
                                    <MapPin className="h-4 w-4 text-rose-500" />
                                    {cls.room}
                                </div>
                            </div>
                        </div>
                    )) : (
                        <div className="p-12 text-center">
                            <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                            <h3 className="text-gray-900 dark:text-white font-medium">No classes scheduled</h3>
                            <p className="text-gray-500 dark:text-gray-400 text-sm">Enjoy your {selectedDay}!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Academics;
