import { useState, useEffect } from 'react';
import axios from 'axios';
import { Utensils, Coffee, Sun, Moon, Calendar } from 'lucide-react';

const MessMenu = () => {
    const [menu, setMenu] = useState([]);
    const [loading, setLoading] = useState(true);
    // Get current day name like "Monday"
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    useEffect(() => {
        fetchMenu();
    }, []);

    const fetchMenu = async () => {
        try {
            const token = JSON.parse(localStorage.getItem('userInfo')).token;
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const { data } = await axios.get(`${import.meta.env.VITE_API_URL}/api/mess`, config);
            setMenu(data);
            setLoading(false);
        } catch (error) {
            console.error(error);
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 dark:text-white">Loading menu...</div>;

    // Sort menu so today is first, then rest
    const sortedMenu = [
        ...menu.filter(m => m.day === todayName),
        ...menu.filter(m => m.day !== todayName)
    ];

    const MealCard = ({ title, items, icon: Icon, color }) => (
        <div className={`p-4 rounded-xl border ${color} bg-white dark:bg-gray-800`}>
            <div className="flex items-center gap-2 mb-2">
                <Icon className="h-5 w-5" />
                <h4 className="font-semibold text-gray-900 dark:text-white">{title}</h4>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300">{items}</p>
        </div>
    );

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-2xl font-bold dark:text-white flex items-center gap-2">
                <Utensils className="h-6 w-6 text-orange-500" />
                Mess Menu
            </h1>

            <div className="grid gap-6">
                {sortedMenu.map((dayMenu) => (
                    <div key={dayMenu._id} className={`rounded-2xl shadow-sm border overflow-hidden ${dayMenu.day === todayName
                        ? 'border-orange-200 dark:border-orange-900 ring-4 ring-orange-50 dark:ring-orange-900/20'
                        : 'border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}>
                        <div className={`p-4 font-bold flex justify-between items-center ${dayMenu.day === todayName
                            ? 'bg-orange-500 text-white'
                            : 'bg-gray-50 dark:bg-gray-700/50 text-gray-700 dark:text-gray-200'
                            }`}>
                            <span>{dayMenu.day}</span>
                            {dayMenu.day === todayName && <span className="text-xs bg-white text-orange-600 px-2 py-0.5 rounded-full">Today</span>}
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 bg-white dark:bg-gray-800">
                            <MealCard
                                title="Breakfast"
                                items={dayMenu.breakfast}
                                icon={Coffee}
                                color="border-yellow-100 dark:border-yellow-900 text-yellow-600 dark:text-yellow-400"
                            />
                            <MealCard
                                title="Lunch"
                                items={dayMenu.lunch}
                                icon={Sun}
                                color="border-orange-100 dark:border-orange-900 text-orange-600 dark:text-orange-400"
                            />
                            <MealCard
                                title="Snacks"
                                items={dayMenu.snacks}
                                icon={Coffee}
                                color="border-amber-100 dark:border-amber-900 text-amber-600 dark:text-amber-400"
                            />
                            <MealCard
                                title="Dinner"
                                items={dayMenu.dinner}
                                icon={Moon}
                                color="border-indigo-100 dark:border-indigo-900 text-indigo-600 dark:text-indigo-400"
                            />
                        </div>
                    </div>
                ))}
            </div>

            {menu.length === 0 && <div className="text-center text-gray-500">No menu available.</div>}
        </div>
    );
};

export default MessMenu;
