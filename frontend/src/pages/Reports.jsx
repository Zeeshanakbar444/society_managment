import React from 'react';
import { useApi } from '../hooks/useApi';
import { BarChart3, PieChart, TrendingDown, Clock, FileText } from 'lucide-react';

export default function Reports() {
    const { data: bills } = useApi('bills');
    const { data: expenses } = useApi('expenses');
    const { data: complaints } = useApi('complaints');

    const totalRevenue = bills.filter(b => b.status === 'PAID').reduce((sum, b) => sum + Number(b.amount), 0);
    const pendingDues = bills.filter(b => b.status !== 'PAID').reduce((sum, b) => sum + Number(b.amount), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

    const categories = [...new Set(expenses.map(e => e.category))];

    return (
        <div className="space-y-6 md:space-y-10">
            <header>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Financial Reports</h2>
                <p className="text-slate-500 mt-1 text-sm md:text-base">Deep dive into community revenue and expenditures.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Revenue vs Expenses */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <BarChart3 className="text-primary-500" /> Revenue vs Expenses
                    </h3>
                    <div className="space-y-6">
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Total Collected</span>
                                <span className="text-sm font-bold text-green-600">${totalRevenue}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-full" style={{ width: `${(totalRevenue / (totalRevenue + totalExpenses || 1)) * 100}%` }} />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Total Outflow</span>
                                <span className="text-sm font-bold text-red-600">${totalExpenses}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                                <div className="bg-red-500 h-full" style={{ width: `${(totalExpenses / (totalRevenue + totalExpenses || 1)) * 100}%` }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Delinquency Report */}
                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <TrendingDown className="text-red-500" /> Delinquency Tracking
                    </h3>
                    <div className="flex items-center justify-center py-4">
                        <div className="text-center">
                            <p className="text-4xl font-black text-red-600">${pendingDues}</p>
                            <p className="text-slate-400 text-sm mt-1">Total Outstanding Dues</p>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3">
                        {bills.filter(b => b.status !== 'PAID').slice(0, 3).map(b => (
                            <div key={b.id} className="flex items-center justify-between p-3 bg-red-50 rounded-xl">
                                <span className="text-sm font-bold text-red-700">House {b.house.houseNumber}</span>
                                <span className="text-sm font-mono text-red-600">${b.amount}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <FileText className="text-slate-700" /> Category-wise Expenses
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                    {categories.map(cat => (
                        <div key={cat} className="p-4 border border-slate-100 rounded-2xl bg-slate-50 text-center">
                            <p className="text-xs text-slate-400 uppercase font-bold tracking-widest leading-loose">{cat}</p>
                            <p className="text-xl font-bold text-slate-800">${expenses.filter(e => e.category === cat).reduce((sum, e) => sum + Number(e.amount), 0)}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
