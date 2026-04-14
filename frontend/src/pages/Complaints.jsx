import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from "../context/AuthContext";
import api from '../lib/api';
import { MessageSquare, AlertCircle, CheckCircle2, Clock, Send } from 'lucide-react';
import { toast } from 'react-hot-toast';

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
    const [adminNotes, setAdminNotes] = useState({}); // keyed by complaint id

    const raiseComplaint = async (e) => {
        // ...
        e.preventDefault();
        try {
            await toast.promise(
                api.post('complaints', newComplaint),
                {
                    loading: 'Sending complaint...',
                    success: 'Complaint sent successfully!',
                    error: (err) => err.response?.data?.error || "Failed to send complaint"
                }
            );
            setNewComplaint({ subject: '', description: '', houseId: '', userId: '' });
            refreshComplaints();
        } catch (err) {
            console.error(err);
        }
    };

    const updateStatus = async (id, status) => {
        try {
            await toast.promise(
                api.patch(`complaints/${id}/status`, { status, adminNote: adminNotes[id] || undefined }),
                {
                    loading: 'Updating status...',
                    success: 'Status updated successfully!',
                    error: (err) => err.response?.data?.error || "Update failed"
                }
            );
            setAdminNotes(prev => ({ ...prev, [id]: '' }));
            refreshComplaints();
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6 md:space-y-8">
            <header>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Complaints CMS</h2>
                <p className="text-slate-500 mt-1 text-sm md:text-base">Resolution workflow for community grievances.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Raise Complaint — members only */}
                {!isAdmin && (
                    <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
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
                    </section>
                )}

                {/* Complaints List */}
                <section className={`space-y-4 ${!isAdmin ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                    {isAdmin && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm font-medium">
                            🛡️ Admin View — You can update complaint statuses below.
                        </div>
                    )}
                    {(complaints || []).length === 0 ? (
                        <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-400">No complaints yet.</div>
                    ) : (complaints || []).map(complaint => (
                        <div
                            key={complaint.id}
                            className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm border-l-4"
                            style={{ borderColor: complaint.status === 'OPEN' ? '#ef4444' : complaint.status === 'RESOLVED' ? '#22c55e' : complaint.status === 'IN_PROGRESS' ? '#eab308' : '#94a3b8' }}
                        >
                            <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        {statusIcons[complaint.status]}
                                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">{complaint.status}</span>
                                    </div>
                                    <h4 className="text-base md:text-lg font-bold text-slate-900">{complaint.subject}</h4>
                                    <p className="text-slate-600 mt-2 text-sm">{complaint.description}</p>
                                    {complaint.adminNote && (
                                        <p className="mt-2 text-xs italic text-slate-400 bg-slate-50 px-3 py-1.5 rounded-lg">
                                            Admin note: {complaint.adminNote}
                                        </p>
                                    )}
                                </div>
                                <div className="text-right text-xs text-slate-400 shrink-0">
                                    {new Date(complaint.createdAt).toLocaleDateString()}
                                    <p className="mt-1 font-bold text-slate-500">#{complaint.house?.houseNumber || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                                {/* Status update buttons — ADMIN ONLY */}
                                {isAdmin ? (
                                    <div className="flex gap-2 flex-wrap">
                                        {complaint.status === 'OPEN' && (
                                            <button
                                                onClick={() => updateStatus(complaint.id, 'IN_PROGRESS')}
                                                className="text-xs font-bold text-amber-600 px-3 py-1 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"
                                            >
                                                Start Progress
                                            </button>
                                        )}
                                        {complaint.status === 'IN_PROGRESS' && (
                                            <button
                                                onClick={() => updateStatus(complaint.id, 'RESOLVED')}
                                                className="text-xs font-bold text-green-600 px-3 py-1 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                                            >
                                                Resolve
                                            </button>
                                        )}
                                        {complaint.status === 'RESOLVED' && (
                                            <div className="flex flex-col gap-2">
                                                <input
                                                    placeholder="Admin closing note (required)..."
                                                    className="text-xs border rounded p-1.5"
                                                    value={adminNotes[complaint.id] || ''}
                                                    onChange={e => setAdminNotes(prev => ({ ...prev, [complaint.id]: e.target.value }))}
                                                />
                                                <button
                                                    onClick={() => updateStatus(complaint.id, 'CLOSED')}
                                                    className="text-xs font-bold text-slate-600 px-3 py-1 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                                >
                                                    Close Complaint
                                                </button>
                                            </div>
                                        )}
                                        {complaint.status === 'CLOSED' && (
                                            <span className="text-xs text-slate-400 italic">Complaint closed</span>
                                        )}
                                    </div>
                                ) : (
                                    <div /> // members see no status controls
                                )}
                                <p className="text-xs text-slate-400">Reporter: {complaint.user?.fullName || 'Anonymous'}</p>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}
