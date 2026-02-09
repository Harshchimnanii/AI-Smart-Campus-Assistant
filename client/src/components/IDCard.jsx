import React, { useRef } from 'react';
import { useReactToPrint } from 'react-to-print';
import { Printer, X } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const IDCard = ({ student, onClose }) => {
    const componentRef = useRef();
    const { user } = useAuth();

    const handlePrint = useReactToPrint({
        content: () => componentRef.current,
        onAfterPrint: async () => {
            // Log generation
            try {
                const config = { headers: { Authorization: `Bearer ${user.token}` } };
                await axios.post(`${import.meta.env.VITE_API_URL}/api/idcard/log`, {
                    studentId: student._id,
                    detailsSnapshot: {
                        name: student.name,
                        rollNumber: student.rollNumber,
                        course: student.department
                    }
                }, config);
                alert('ID Card Generated & Logged Successfully');
            } catch (error) {
                console.error("Failed to log ID card generation", error);
            }
        }
    });

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl shadow-2xl max-w-lg w-full">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold dark:text-white">ID Card Preview</h3>
                    <button onClick={onClose}>
                        <X className="text-gray-500" />
                    </button>
                </div>

                <div className="flex justify-center mb-6">
                    {/* ID Card Design */}
                    <div ref={componentRef} className="w-[320px] h-[500px] bg-white border border-gray-200 shadow-lg relative overflow-hidden rounded-xl flex flex-col font-sans">
                        {/* Header */}
                        <div className="bg-indigo-700 h-24 relative flex items-center justify-center">
                            <div className="absolute top-2 right-2 h-16 w-16 bg-white/10 rounded-full blur-xl"></div>
                            <div className="text-center z-10">
                                <h1 className="text-white font-bold text-lg tracking-wider">CAMPUS AI</h1>
                                <p className="text-indigo-200 text-xs">SMART CAMPUS</p>
                            </div>
                        </div>

                        {/* Photo Area */}
                        <div className="relative -mt-10 self-center">
                            <div className="h-28 w-28 bg-white p-1 rounded-full shadow-md">
                                <div className="h-full w-full bg-gray-200 rounded-full overflow-hidden flex items-center justify-center text-3xl font-bold text-gray-500">
                                    {student.name ? student.name[0] : 'U'}
                                </div>
                            </div>
                        </div>

                        {/* Details */}
                        <div className="text-center mt-2 px-6 flex-1">
                            <h2 className="text-xl font-bold text-gray-800 uppercase">{student.name}</h2>
                            <p className="text-indigo-600 font-semibold text-sm">{student.role === 'student' ? 'STUDENT' : 'FACULTY'}</p>

                            <div className="mt-6 space-y-2 text-left text-sm">
                                <div className="flex border-b border-gray-100 pb-1">
                                    <span className="w-24 text-gray-500 text-xs uppercase font-bold">Roll No</span>
                                    <span className="font-semibold text-gray-800">{student.rollNumber || 'N/A'}</span>
                                </div>
                                <div className="flex border-b border-gray-100 pb-1">
                                    <span className="w-24 text-gray-500 text-xs uppercase font-bold">Course</span>
                                    <span className="font-semibold text-gray-800">B.Tech {student.department}</span>
                                </div>
                                <div className="flex border-b border-gray-100 pb-1">
                                    <span className="w-24 text-gray-500 text-xs uppercase font-bold">DOB</span>
                                    <span className="font-semibold text-gray-800">{student.dob ? new Date(student.dob).toLocaleDateString() : 'N/A'}</span>
                                </div>
                                <div className="flex border-b border-gray-100 pb-1">
                                    <span className="w-24 text-gray-500 text-xs uppercase font-bold">Blood Group</span>
                                    <span className="font-semibold text-gray-800">{student.bloodGroup || 'N/A'}</span>
                                </div>
                                <div className="flex border-b border-gray-100 pb-1">
                                    <span className="w-24 text-gray-500 text-xs uppercase font-bold">Valid Upto</span>
                                    <span className="font-semibold text-gray-800">July 2026</span>
                                </div>
                            </div>
                        </div>

                        {/* Footer / Barcode */}
                        <div className="bg-gray-50 py-3 border-t border-gray-100 text-center">
                            <div className="inline-block bg-black h-8 w-48 mx-auto"></div>
                            <p className="text-[10px] text-gray-400 mt-1">ID: {student._id}</p>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-3">
                    <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                    <button onClick={handlePrint} className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 font-bold">
                        <Printer className="h-4 w-4" /> Print ID Card
                    </button>
                </div>
            </div>
        </div>
    );
};

export default IDCard;
