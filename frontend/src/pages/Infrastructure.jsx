import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import { Plus, Home, Map } from 'lucide-react';

export default function Infrastructure() {
    const { data: streets, postData: addStreet, loading: streetsLoading } = useApi('streets');
    const { data: houses, postData: addHouse, loading: housesLoading } = useApi('houses');

    const [newStreet, setNewStreet] = useState('');
    const [newHouse, setNewHouse] = useState({ houseNumber: '', streetId: '' });

    const handleAddStreet = async (e) => {
        e.preventDefault();
        if (!newStreet) return;
        await addStreet({ name: newStreet });
        setNewStreet('');
    };

    const handleAddHouse = async (e) => {
        e.preventDefault();
        if (!newHouse.houseNumber || !newHouse.streetId) return;
        await addHouse(newHouse);
        setNewHouse({ houseNumber: '', streetId: '' });
    };

    return (
        <div className="space-y-6 md:space-y-10">
            <header>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Infrastructure</h2>
                <p className="text-slate-500 mt-1 text-sm md:text-base">Manage streets and houses in the community.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Streets Section */}
                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Map size={20} className="text-primary-500" />
                            Streets
                        </h3>
                    </div>

                    <form onSubmit={handleAddStreet} className="flex flex-col sm:flex-row gap-2 mb-6">
                        <input
                            type="text"
                            placeholder="Enter Street Name (e.g. Street 10)"
                            value={newStreet}
                            onChange={(e) => setNewStreet(e.target.value)}
                            className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                        />
                        <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center gap-2 font-medium">
                            <Plus size={18} />
                            Add
                        </button>
                    </form>

                    <div className="space-y-3">
                        {streetsLoading ? <p>Loading...</p> : streets.map((street) => (
                            <div key={street.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <span className="font-medium text-slate-700">{street.name}</span>
                                <span className="text-xs text-slate-400 font-mono">{street.id.split('-')[0]}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Houses Section */}
                <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-semibold flex items-center gap-2">
                            <Home size={20} className="text-primary-500" />
                            Houses/Flats
                        </h3>
                    </div>

                    <form onSubmit={handleAddHouse} className="space-y-4 mb-6">
                        <div className="flex flex-col sm:flex-row gap-2">
                            <input
                                type="text"
                                placeholder="House Number"
                                value={newHouse.houseNumber}
                                onChange={(e) => setNewHouse({ ...newHouse, houseNumber: e.target.value })}
                                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all"
                            />
                            <select
                                value={newHouse.streetId}
                                onChange={(e) => setNewHouse({ ...newHouse, streetId: e.target.value })}
                                className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all appearance-none"
                            >
                                <option value="">Select Street</option>
                                {streets.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                            </select>
                        </div>
                        <button type="submit" className="w-full bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center gap-2 font-medium">
                            <Plus size={18} />
                            Add House
                        </button>
                    </form>

                    <div className="space-y-3">
                        {housesLoading ? <p>Loading...</p> : houses.slice(0, 5).map((house) => (
                            <div key={house.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div>
                                    <span className="font-medium text-slate-700 block">{house.houseNumber}</span>
                                    <span className="text-xs text-slate-400 italic">{house.street?.name}</span>
                                </div>
                                <span className="text-xs text-slate-400 font-mono">{house.id.split('-')[0]}</span>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
