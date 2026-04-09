import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import {useAuth} from "../context/AuthContext"
import api from '../lib/api';
import { MessageSquare, AlertCircle, CheckCircle2, Clock, Send } from 'lucide-react';

const statusIcons = {
    OPEN: <AlertCircle className="text-red-500" size={20} />,
    IN_PROGRESS: <Clock className="text-amber-500" size={20} />,
    RESOLVED: <CheckCircle2 className="text-green-500" size={20} />,
    CLOSED: <CheckCircle2 className="text-slate-400" size={20} />,
};

export default function Complaints() {
    const { data: complaints, refresh: refreshComplaints } = useApi('complaints');
    const { data: houses } = useApi('houses');
    const { data: residents } = useApi('residents');
const { profile } = useAuth();
    const isAdmin = profile?.role === 'ADMIN';
    const [newComplaint, setNewComplaint] = useState({ subject: '', description: '', houseId: '', userId: '' });
    const [adminNote, setAdminNote] = useState('');

    const raiseComplaint = async (e) => {
        e.preventDefault();
        try {
            await api.post('complaints', newComplaint);
            setNewComplaint({ subject: '', description: '', houseId: '', userId: '' });
            refreshComplaints();
        } catch (err) {
            alert(err.response?.data?.error || "Failed to send complaint");
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await api.patch(`complaints/${id}/status`, { status, adminNote });
            setAdminNote('');
            refreshComplaints();
        } catch (err) {
            alert(err.response?.data?.error || "Update failed");
        }
    };

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-slate-900">Complaints CMS</h2>
                <p className="text-slate-500 mt-1">Resolution workflow for community grievances.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {
                !isAdmin ?   <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <MessageSquare size={20} className="text-red-500" />
                        Raise Complaint
                    </h3>
                    <form onSubmit={raiseComplaint} className="space-y-4">
                        <input
                            placeholder="Subject"
                            required
                            value={newComplaint.subject}
                            onChange={e => setNewComplaint({ ...newComplaint, subject: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                        <textarea
                            placeholder="Detailed Description"
                            required
                            rows="3"
                            value={newComplaint.description}
                            onChange={e => setNewComplaint({ ...newComplaint, description: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                        />
                        <select
                            required
                            value={newComplaint.userId}
                            onChange={e => setNewComplaint({ ...newComplaint, userId: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg appearance-none"
                        >
                            <option value="">Reporter</option>
                            {(residents || []).map(r => <option key={r.id} value={r.id}>{r.fullName}</option>)}
                        </select>
                        <select
                            required
                            value={newComplaint.houseId}
                            onChange={e => setNewComplaint({ ...newComplaint, houseId: e.target.value })}
                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg appearance-none"
                        >
                            <option value="">House Affected</option>
                            {(houses || []).map(h => <option key={h.id} value={h.id}>{h.houseNumber}</option>)}
                        </select>
                        <button type="submit" className="w-full bg-slate-900 text-white py-2 rounded-lg font-bold hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                            <Send size={18} /> Send Complaint
                        </button>
                    </form>
                </section>:""
              }

                <section className="lg:col-span-2 space-y-4">
                    {(complaints || []).map(complaint => (
                        <div key={complaint.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4" style={{ borderColor: complaint.status === 'OPEN' ? '#ef4444' : complaint.status === 'RESOLVED' ? '#22c55e' : '#eab308' }}>
                            <div className="flex items-start justify-between">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        {statusIcons[complaint.status]}
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{complaint.status}</span>
                                    </div>
                                    <h4 className="text-lg font-bold text-slate-900">{complaint.subject}</h4>
                                    <p className="text-slate-600 mt-2 text-sm">{complaint.description}</p>
                                </div>
                                <div className="text-right text-xs text-slate-400">
                                    {new Date(complaint.createdAt).toLocaleDateString()}
                                    <p className="mt-1 font-bold text-slate-500">#{complaint.house?.houseNumber || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                <div className="flex gap-2">
                                    {complaint.status === 'OPEN' && (
                                        <button onClick={() => updateStatus(complaint.id, 'IN_PROGRESS')} className="text-xs font-bold text-amber-600 px-3 py-1 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors">Start Progress</button>
                                    )}
                                    {complaint.status === 'IN_PROGRESS' && (
                                        <button onClick={() => updateStatus(complaint.id, 'RESOLVED')} className="text-xs font-bold text-green-600 px-3 py-1 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">Resolve</button>
                                    )}
                                    {complaint.status === 'RESOLVED' && (
                                        <div className="flex flex-col gap-2 w-full">
                                            <input
                                                placeholder="Admin closing note..."
                                                className="text-xs border rounded p-1 mb-1"
                                                onChange={e => setAdminNote(e.target.value)}
                                            />
                                            <button onClick={() => updateStatus(complaint.id, 'CLOSED')} className="text-xs font-bold text-slate-600 px-3 py-1 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">Close Complaint</button>
                                        </div>
                                    )}
                                </div>
                                <p className="text-xs text-slate-400">Reporter: {complaint.user?.fullName || 'Anonymous'}</p>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}
