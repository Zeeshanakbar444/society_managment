import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { UserPlus, User, Mail, Phone, Home as HomeIcon } from 'lucide-react';

export default function Residents() {
    const { data: residents, postData: addResident, loading } = useApi('residents');
    const { data: houses } = useApi('houses');

    const [newResident, setNewResident] = useState({
        id: '', // Firebase UID (using random for demo)
        fullName: '',
        email: '',
        phoneNumber: '',
        residentType: 'OWNER',
        houseId: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        const id = `user_${Math.random().toString(36).substr(2, 9)}`;
        await addResident({ ...newResident, id });
        setNewResident({ id: '', fullName: '', email: '', phoneNumber: '', residentType: 'OWNER', houseId: '' });
    };

    return (
        <div className="space-y-8">
            <header>
                <h2 className="text-3xl font-bold text-slate-900">Residents</h2>
                <p className="text-slate-500 mt-1">Manage member profiles and occupancy status.</p>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <section className="xl:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                        <UserPlus size={20} className="text-primary-500" />
                        Add Resident
                    </h3>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                required
                                value={newResident.fullName}
                                onChange={e => setNewResident({ ...newResident, fullName: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    value={newResident.email}
                                    onChange={e => setNewResident({ ...newResident, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                <input
                                    type="text"
                                    required
                                    value={newResident.phoneNumber}
                                    onChange={e => setNewResident({ ...newResident, phoneNumber: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Ownership Type</label>
                            <select
                                value={newResident.residentType}
                                onChange={e => setNewResident({ ...newResident, residentType: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
                            >
                                <option value="OWNER">Owner</option>
                                <option value="TENANT">Tenant</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Assign House</label>
                            <select
                                required
                                value={newResident.houseId}
                                onChange={e => setNewResident({ ...newResident, houseId: e.target.value })}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
                            >
                                <option value="">Select House</option>
                                {houses.map(h => <option key={h.id} value={h.id}>{h.houseNumber} ({h.street?.name})</option>)}
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors mt-2">
                            Save Resident
                        </button>
                    </form>
                </section>

                <section className="xl:col-span-2 space-y-4">
                    {loading ? (
                        <div className="animate-pulse space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100"></div>)}
                        </div>
                    ) : residents.map(resident => (
                        <div key={resident.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-primary-200 transition-colors">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                                    <User size={24} />
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-900">{resident.fullName}</h4>
                                    <div className="flex items-center gap-4 mt-1 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><Mail size={14} /> {resident.email || 'N/A'}</span>
                                        <span className="flex items-center gap-1"><Phone size={14} /> {resident.phoneNumber}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${resident.residentType === 'OWNER' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                    {resident.residentType}
                                </span>
                                <div className="flex items-center gap-1 mt-2 text-sm text-slate-600 justify-end font-medium">
                                    <HomeIcon size={14} /> {resident.house?.houseNumber}
                                </div>
                            </div>
                        </div>
                    ))}
                </section>
            </div>
        </div>
    );
}
