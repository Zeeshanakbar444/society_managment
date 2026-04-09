import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Calendar, Filter, Download, FileText } from 'lucide-react';

export default function Billing() {
    const { profile } = useAuth();
    const isAdmin = profile?.role === 'ADMIN';
    const { data: bills, refresh: refreshBills } = useApi('bills');
    const { data: expenses } = useApi('expenses');
    const [genLoading, setGenLoading] = useState(false);

    const generateBills = async () => {
        setGenLoading(true);
        try {
            await api.post('bills/generate', {
                amount: 2500,
                dueDate: new Date(new Date().setDate(25)),
                billingMonth: new Date(),
            });
            await refreshBills();
            alert('Bills generated successfully!');
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.error || "Generation failed");
        } finally {
            setGenLoading(false);
        }
    };

    const markPaid = async (id) => {
        try {
            await api.patch(`bills/${id}/status`, { status: 'PAID' });
            refreshBills();
        } catch (err) {
            alert("Failed to update status");
        }
    };

    const downloadReceipt = (bill) => {
        const receiptContent = `
SOCIETY OS - PAYMENT RECEIPT
==============================
Receipt ID: ${bill.id}
House Number: ${bill.house?.houseNumber || 'N/A'}
Billing Month: ${new Date(bill.billingMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
Amount Paid: $${bill.amount}
Status: ${bill.status}
Paid Date: ${bill.paidAt ? new Date(bill.paidAt).toLocaleDateString() : 'N/A'}
==============================
Thank you for your payment!
        `.trim();

        const blob = new Blob([receiptContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Receipt-${bill.house?.houseNumber || 'N/A'}-${new Date(bill.billingMonth).toISOString().slice(0, 7)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // Filter bills for members to show only their own
    const displayBills = isAdmin ? bills : bills?.filter(b => b.houseNumber === profile?.houseNumber) || [];

    return (
        <div className="space-y-8">
            <header className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold text-slate-900">{isAdmin ? 'Financials' : 'My Dues'}</h2>
                    <p className="text-slate-500 mt-1">{isAdmin ? 'Manage community billing and expenses.' : 'View your payment history and outstanding dues.'}</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={generateBills}
                        disabled={genLoading}
                        className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center gap-2 disabled:opacity-50"
                    >
                        <Calendar size={20} />
                        {genLoading ? 'Generating...' : 'Generate New Cycle'}
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Billing Overview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800">Recent Bills</h3>
                        <div className="flex gap-2">
                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><Filter size={18} /></button>
                            <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"><Download size={18} /></button>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <table className="w-full text-left">
                            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-medium">
                                <tr>
                                    <th className="px-6 py-4">House No</th>
                                    <th className="px-6 py-4">Month</th>
                                    <th className="px-6 py-4">Amount</th>
                                    <th className="px-6 py-4">Status</th>
                                    <th className="px-6 py-4">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {displayBills.slice(0, 10).map((bill) => (
                                    <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-slate-700">{bill.house?.houseNumber || 'N/A'}</td>
                                        <td className="px-6 py-4 text-slate-500">{new Date(bill.billingMonth).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</td>
                                        <td className="px-6 py-4 text-slate-700 font-semibold">${bill.amount}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${bill.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                }`}>
                                                {bill.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {isAdmin && bill.status !== 'PAID' && (
                                                <button
                                                    onClick={() => markPaid(bill.id)}
                                                    className="text-primary-600 text-sm font-bold hover:underline"
                                                >
                                                    Mark Paid
                                                </button>
                                            )}
                                            {!isAdmin && bill.status === 'PAID' && (
                                                <button
                                                    onClick={() => downloadReceipt(bill)}
                                                    className="flex items-center gap-1 text-green-600 text-sm font-bold hover:underline"
                                                >
                                                    <FileText size={14} />
                                                    Receipt
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Expense Summary - Admin Only */}
                {isAdmin && (
                <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-slate-800">Expense Ledger</h3>
                    <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                        {expenses?.map((expense) => (
                            <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50">
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{expense.title}</p>
                                    <p className="text-xs text-slate-400">{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                                </div>
                                <p className="font-bold text-red-500">-${expense.amount}</p>
                            </div>
                        ))}
                        <button className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:border-primary-300 hover:text-primary-500 transition-all flex items-center justify-center gap-2">
                            <DollarSign size={16} />
                            Log New Expense
                        </button>
                    </div>
                </div>
                )}
            </div>
        </div>
    );
}
