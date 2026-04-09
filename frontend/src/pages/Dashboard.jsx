import React from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { TrendingUp, Users, Home, AlertCircle, DollarSign, ArrowUpRight, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { auth } from '../lib/firebase';
import api from '../lib/api';

export default function Dashboard() {
    const { profile } = useAuth();
    const navigate = useNavigate();
    const isAdmin = profile?.role === 'ADMIN';

    const handleSeed = async () => {
        if (!window.confirm("This will add demo streets, houses, and residents. Continue?")) return;
        try {
            await api.post('/seed');
            alert("Demo data seeded! Please refresh the page.");
            window.location.reload();
        } catch (err) {
            alert("Seed failed: " + (err.response?.data?.error || err.message));
        }
    };

    const { data: houses } = useApi('houses');
    const { data: residents } = useApi('residents');
    const { data: complaints } = useApi('complaints');
    const { data: bills } = useApi('bills');

    // Filter data for Members
    const userComplaints = isAdmin ? complaints : complaints.filter(c => c.userId === profile?.id);
    const userBills = isAdmin ? bills : bills.filter(b => b.houseId === profile?.houseId);

    const stats = isAdmin ? [
        { label: 'Total Revenue', value: `$${bills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + Number(b.amount), 0)}`, icon: DollarSign, color: 'text-green-600', bg: 'bg-green-50' },
        { label: 'Pending Dues', value: `$${bills.filter(b => b.status !== 'PAID').reduce((sum, b) => sum + Number(b.amount), 0)}`, icon: TrendingUp, color: 'text-primary-600', bg: 'bg-primary-50' },
        { label: 'Active Complaints', value: complaints.filter(c => c.status !== 'CLOSED').length, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Residents', value: residents.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    ] : [
        { label: 'Your Outstanding', value: `$${userBills.filter(b => b.status !== 'PAID').reduce((sum, b) => sum + Number(b.amount), 0)}`, icon: DollarSign, color: 'text-red-600', bg: 'bg-red-50' },
        { label: 'Your Complaints', value: userComplaints.length, icon: AlertCircle, color: 'text-primary-600', bg: 'bg-primary-50' },
        { label: 'House No', value: profile?.house?.houseNumber || 'N/A', icon: Home, color: 'text-blue-600', bg: 'bg-blue-50' },
    ];

    return (
        <div className="space-y-10">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">{isAdmin ? 'Admin Dashboard' : `Welcome, ${profile?.fullName}`}</h2>
                    <p className="text-slate-500 mt-1">{isAdmin ? 'Community overview and quick actions.' : 'Manage your community dues and grievances.'}</p>
                </div>
                <button
                    onClick={() => auth.signOut()}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-600 hover:bg-red-50 hover:text-red-600 transition-all font-semibold text-sm shadow-sm"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-start justify-between">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">{stat.label}</p>
                            <p className="text-2xl font-bold mt-2 text-slate-900">{stat.value}</p>
                        </div>
                        <div className={`${stat.bg} ${stat.color} p-3 rounded-xl`}>
                            <stat.icon size={24} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-800">{isAdmin ? 'Recent Activity' : 'Your Recent Complaints'}</h3>
                        <button className="text-primary-600 text-sm font-bold hover:underline flex items-center gap-1">
                            View All <ArrowUpRight size={14} />
                        </button>
                    </div>
                    <div className="space-y-6">
                        {userComplaints.slice(0, 5).map(c => (
                            <div key={c.id} className="flex gap-4">
                                <div className="w-2 h-2 mt-2 rounded-full bg-primary-400 shrink-0" />
                                <div>
                                    <p className="text-slate-900 font-medium">{c.subject}</p>
                                    <p className="text-slate-500 text-sm">{isAdmin ? `Reported by ${c.user.fullName} for House ${c.house.houseNumber}` : c.status}</p>
                                    <p className="text-xs text-slate-400 mt-1">{new Date(c.createdAt).toLocaleTimeString()}</p>
                                </div>
                            </div>
                        ))}
                        {userComplaints.length === 0 && <p className="text-slate-400 text-sm">No complaints found.</p>}
                    </div>
                </div>

                {isAdmin ? (
                    <div className="bg-gradient-to-br from-primary-600 to-primary-800 p-8 rounded-2xl text-white shadow-xl shadow-primary-100 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-bold">Quick Actions</h3>
                            <p className="text-primary-100 text-sm mt-2 opacity-80">Common administrative tasks at your fingertips.</p>
                        </div>
                        <div className="mt-8 space-y-3">
                            <button onClick={() => navigate('/billing')} className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl transition-all text-left px-4 text-sm font-medium border border-white/10">Generate Bills</button>
                            <button onClick={() => navigate('/residents')} className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl transition-all text-left px-4 text-sm font-medium border border-white/10">Add New Resident</button>
                            <button onClick={() => navigate('/infrastructure')} className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl transition-all text-left px-4 text-sm font-medium border border-white/10">Update Infrastructure</button>
                            <button onClick={handleSeed} className="w-full bg-amber-500/20 hover:bg-amber-500/30 py-3 rounded-xl transition-all text-left px-4 text-sm font-bold border border-amber-500/30 text-amber-200 mt-4">Seed Demo Data (Dropdowns)</button>
                        </div>
                    </div>
                ) : (
                    <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center text-center">
                        <div className="w-16 h-16 bg-primary-50 rounded-full flex items-center justify-center mx-auto text-primary-600 mb-4">
                            <Home size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Need Help?</h3>
                        <p className="text-slate-400 text-sm mt-2 mb-6">Raise a complaint if you're facing any issues with community services.</p>
                        <button onClick={() => navigate('/complaints')} className="bg-primary-600 text-white py-3 rounded-xl font-bold hover:bg-primary-700 transition-all">Raise New Complaint</button>
                    </div>
                )}
            </div>
        </div>
    );
}
