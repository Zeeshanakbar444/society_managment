import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import api from '../lib/api';
import { UserPlus, User, Mail, Phone, Home as HomeIcon, Edit2, Trash2, PlusCircle, X, Check, Building2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

// ─── Residents Section ───────────────────────────────────────────────────────
export default function Residents() {
    const { data: residents, refresh: refreshResidents, loading } = useApi('residents');
    const { data: houses, refresh: refreshHouses } = useApi('houses');
    const { data: streets } = useApi('streets');

    // ── Resident form state ──
    const [residentForm, setResidentForm] = useState({
        fullName: '', email: '', phoneNumber: '', password: '', residentType: 'OWNER', houseId: ''
    });
    const [editingResident, setEditingResident] = useState(null); // resident object being edited

    // ── House form state ──
    const [houseForm, setHouseForm] = useState({ houseNumber: '', streetId: '' });
    const [editingHouse, setEditingHouse] = useState(null); // house object being edited

    const [activeTab, setActiveTab] = useState('residents'); // 'residents' | 'houses'

    // ═══ RESIDENT HANDLERS ═══

    const handleResidentSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingResident) {
                // Update existing resident
                await toast.promise(
                    api.patch(`/residents/${editingResident.id}`, {
                        fullName: residentForm.fullName,
                        email: residentForm.email,
                        phoneNumber: residentForm.phoneNumber,
                        residentType: residentForm.residentType,
                        houseId: residentForm.houseId || null,
                    }),
                    {
                        loading: 'Updating resident...',
                        success: 'Resident updated successfully!',
                        error: (err) => err.response?.data?.error || 'Failed to update resident.'
                    }
                );
                setEditingResident(null);
            } else {
                // Create new resident via Firebase signup
                const id = `user_${Math.random().toString(36).substr(2, 9)}`;
                await toast.promise(
                    api.post('/residents', { id, ...residentForm }),
                    {
                        loading: 'Creating resident...',
                        success: 'Resident created successfully!',
                        error: (err) => err.response?.data?.error || 'Failed to create resident.'
                    }
                );
            }
            setResidentForm({ fullName: '', email: '', phoneNumber: '', password: '', residentType: 'OWNER', houseId: '' });
            refreshResidents();
        } catch (err) {
            console.error(err);
        }
    };

    const startEditResident = (r) => {
        setEditingResident(r);
        setResidentForm({
            fullName: r.fullName || '',
            email: r.email || '',
            phoneNumber: r.phoneNumber || '',
            password: '',
            residentType: r.residentType || 'OWNER',
            houseId: r.houseId || '',
        });
    };

    const cancelEditResident = () => {
        setEditingResident(null);
        setResidentForm({ fullName: '', email: '', phoneNumber: '', password: '', residentType: 'OWNER', houseId: '' });
    };

    const deleteResident = async (id) => {
        if (!window.confirm('Delete this resident? All their complaints will also be removed.')) return;
        try {
            await toast.promise(
                api.delete(`/residents/${id}`),
                {
                    loading: 'Deleting resident...',
                    success: 'Resident deleted successfully!',
                    error: (err) => err.response?.data?.error || 'Failed to delete resident.'
                }
            );
            refreshResidents();
        } catch (err) {
            console.error(err);
        }
    };

    // ═══ HOUSE HANDLERS ═══

    const handleHouseSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingHouse) {
                await toast.promise(
                    api.patch(`/houses/${editingHouse.id}`, {
                        houseNumber: houseForm.houseNumber,
                        streetId: houseForm.streetId,
                    }),
                    {
                        loading: 'Updating house...',
                        success: 'House updated successfully!',
                        error: (err) => err.response?.data?.error || 'Failed to update house.'
                    }
                );
                setEditingHouse(null);
            } else {
                await toast.promise(
                    api.post('/houses', houseForm),
                    {
                        loading: 'Adding house...',
                        success: 'House created successfully!',
                        error: (err) => err.response?.data?.error || 'Failed to create house. Number might not be unique.'
                    }
                );
            }
            setHouseForm({ houseNumber: '', streetId: '' });
            refreshHouses();
        } catch (err) {
            console.error(err);
        }
    };

    const startEditHouse = (h) => {
        setEditingHouse(h);
        setHouseForm({ houseNumber: h.houseNumber || '', streetId: h.streetId || '' });
    };

    const cancelEditHouse = () => {
        setEditingHouse(null);
        setHouseForm({ houseNumber: '', streetId: '' });
    };

    const deleteHouse = async (id) => {
        if (!window.confirm('Delete this house? This may affect residents and bills linked to it.')) return;
        try {
            await toast.promise(
                api.delete(`/houses/${id}`),
                {
                    loading: 'Deleting house...',
                    success: 'House deleted successfully!',
                    error: (err) => err.response?.data?.error || 'Failed to delete house.'
                }
            );
            refreshHouses();
        } catch (err) {
            console.error(err);
        }
    };

    // ─── Pill Tab Switch ────────────────────────────────────────────────────
    return (
        <div className="space-y-6 md:space-y-8">
            <header>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Residents &amp; Houses</h2>
                <p className="text-slate-500 mt-1 text-sm md:text-base">Manage member profiles and house assignments.</p>
            </header>

            {/* Tab Switcher */}
            <div className="flex gap-2">
                <button
                    onClick={() => setActiveTab('residents')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm transition-all ${activeTab === 'residents' ? 'bg-primary-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    <User size={16} /> Residents
                </button>
                <button
                    onClick={() => setActiveTab('houses')}
                    className={`flex items-center gap-2 px-5 py-2 rounded-full font-semibold text-sm transition-all ${activeTab === 'houses' ? 'bg-primary-600 text-white shadow' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
                >
                    <Building2 size={16} /> Houses
                </button>
            </div>

            {/* ═══════════════ RESIDENTS TAB ═══════════════ */}
            {activeTab === 'residents' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
                    {/* Resident Form */}
                    <section className="xl:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            {editingResident ? <Edit2 size={20} className="text-amber-500" /> : <UserPlus size={20} className="text-primary-500" />}
                            {editingResident ? `Edit: ${editingResident.fullName}` : 'Add Resident'}
                        </h3>

                        <form onSubmit={handleResidentSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    type="text" required
                                    value={residentForm.fullName}
                                    onChange={e => setResidentForm({ ...residentForm, fullName: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                />
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="email"
                                        value={residentForm.email}
                                        onChange={e => setResidentForm({ ...residentForm, email: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
                                    <input
                                        type="text" required
                                        value={residentForm.phoneNumber}
                                        onChange={e => setResidentForm({ ...residentForm, phoneNumber: e.target.value })}
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                            </div>
                            {!editingResident && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                                    <input
                                        type="password"
                                        value={residentForm.password}
                                        onChange={e => setResidentForm({ ...residentForm, password: e.target.value })}
                                        placeholder="Initial login password"
                                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                    />
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Ownership Type</label>
                                <select
                                    value={residentForm.residentType}
                                    onChange={e => setResidentForm({ ...residentForm, residentType: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
                                >
                                    <option value="OWNER">Owner</option>
                                    <option value="TENANT">Tenant</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Assign House</label>
                                <select
                                    value={residentForm.houseId}
                                    onChange={e => setResidentForm({ ...residentForm, houseId: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
                                >
                                    <option value="">Select House (optional)</option>
                                    {(houses || []).map(h => (
                                        <option key={h.id} value={h.id}>{h.houseNumber} {h.street ? `(${h.street.name})` : ''}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button type="submit" className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                                    <Check size={16} /> {editingResident ? 'Update Resident' : 'Save Resident'}
                                </button>
                                {editingResident && (
                                    <button type="button" onClick={cancelEditResident} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold hover:bg-slate-200 transition-colors">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>

                    {/* Resident List */}
                    <section className="xl:col-span-2 space-y-4">
                        {loading ? (
                            <div className="animate-pulse space-y-4">
                                {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-100" />)}
                            </div>
                        ) : residents.length === 0 ? (
                            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-400">No residents yet.</div>
                        ) : residents.map(resident => (
                            <div key={resident.id} className="bg-white p-4 md:p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 hover:border-primary-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                                        <User size={24} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">{resident.fullName}</h4>
                                        <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-slate-500">
                                            <span className="flex items-center gap-1"><Mail size={13} /> {resident.email || 'N/A'}</span>
                                            <span className="flex items-center gap-1"><Phone size={13} /> {resident.phoneNumber}</span>
                                            <span className="flex items-center gap-1"><HomeIcon size={13} /> {resident.house?.houseNumber || 'Unassigned'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${resident.residentType === 'OWNER' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {resident.residentType}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startEditResident(resident)}
                                            className="text-amber-500 hover:text-amber-700 p-1.5 hover:bg-amber-50 rounded-lg transition"
                                            title="Edit Resident"
                                        >
                                            <Edit2 size={16} />
                                        </button>
                                        <button
                                            onClick={() => deleteResident(resident.id)}
                                            className="text-red-500 hover:text-red-700 p-1.5 hover:bg-red-50 rounded-lg transition"
                                            title="Delete Resident"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            )}

            {/* ═══════════════ HOUSES TAB ═══════════════ */}
            {activeTab === 'houses' && (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 md:gap-8">
                    {/* House Form */}
                    <section className="xl:col-span-1 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm h-fit">
                        <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                            {editingHouse ? <Edit2 size={20} className="text-amber-500" /> : <PlusCircle size={20} className="text-primary-500" />}
                            {editingHouse ? `Edit House: ${editingHouse.houseNumber}` : 'Add House'}
                        </h3>

                        <form onSubmit={handleHouseSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">House Number</label>
                                <input
                                    type="text" required
                                    placeholder="e.g. H-101"
                                    value={houseForm.houseNumber}
                                    onChange={e => setHouseForm({ ...houseForm, houseNumber: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Street</label>
                                <select
                                    required
                                    value={houseForm.streetId}
                                    onChange={e => setHouseForm({ ...houseForm, streetId: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all appearance-none"
                                >
                                    <option value="">Select Street</option>
                                    {(streets || []).map(s => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2 pt-1">
                                <button type="submit" className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors flex items-center justify-center gap-2">
                                    <Check size={16} /> {editingHouse ? 'Update House' : 'Save House'}
                                </button>
                                {editingHouse && (
                                    <button type="button" onClick={cancelEditHouse} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg font-semibold hover:bg-slate-200 transition-colors">
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </form>
                    </section>

                    {/* House List */}
                    <section className="xl:col-span-2 space-y-4">
                        {(houses || []).length === 0 ? (
                            <div className="bg-white p-10 rounded-2xl border border-slate-200 text-center text-slate-400">No houses yet.</div>
                        ) : (houses || []).map(house => (
                            <div key={house.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between hover:border-primary-200 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-600">
                                        <HomeIcon size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900">#{house.houseNumber}</h4>
                                        <p className="text-sm text-slate-500 mt-0.5">{house.street?.name || 'No street'}</p>
                                        <p className="text-xs text-slate-400 mt-0.5">{house.residents?.length || 0} resident(s)</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => startEditHouse(house)}
                                        className="text-amber-500 hover:text-amber-700 p-2 hover:bg-amber-50 rounded-lg transition"
                                        title="Edit House"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => deleteHouse(house.id)}
                                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition"
                                        title="Delete House"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </section>
                </div>
            )}
        </div>
    );
}
