import React, { useState } from 'react';
import { useApi } from '../hooks/useApi';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { DollarSign, Calendar, Filter, Download, FileText, AlertCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function Billing() {
    const { profile } = useAuth();
    const isAdmin = profile?.role === 'ADMIN';
    const { data: bills, refresh: refreshBills } = useApi('bills');
    const { data: expenses, refresh: refreshExpenses } = useApi('expenses');
    const [genLoading, setGenLoading] = useState(false);

    // Filtering states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');

    // Modal states
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);

    const [expenseForm, setExpenseForm] = useState({ title: '', amount: '', category: 'Maintenance', description: '' });
    const [generateForm, setGenerateForm] = useState({
        amount: 2500,
        billingMonth: new Date().toISOString().slice(0, 7), // YYYY-MM
        dueDate: new Date(new Date().getFullYear(), new Date().getMonth(), 25).toISOString().slice(0, 10), // YYYY-MM-DD
    });

    const generateBills = async (e) => {
        if (e) e.preventDefault();
        setGenLoading(true);
        try {
            await toast.promise(
                api.post('bills/generate', {
                    amount: Number(generateForm.amount),
                    dueDate: new Date(generateForm.dueDate).toISOString(),
                    billingMonth: new Date(generateForm.billingMonth + "-01").toISOString(),
                }),
                {
                    loading: 'Generating bills for all houses...',
                    success: (res) => res.data?.message || 'Bills generated successfully!',
                    error: (err) => err.response?.data?.error || 'Generation failed.'
                }
            );
            setShowGenerateModal(false);
            await refreshBills();
        } catch (err) {
            console.error(err);
        } finally {
            setGenLoading(false);
        }
    };

    const markPaid = async (id) => {
        try {
            await toast.promise(
                api.patch(`bills/${id}/status`, { status: 'PAID' }),
                {
                    loading: 'Updating payment status...',
                    success: 'Payment marked as PAID!',
                    error: 'Failed to update payment status.'
                }
            );
            refreshBills();
        } catch (err) {
            console.error(err);
        }
    };

    const handleAddExpense = async (e) => {
        e.preventDefault();
        try {
            await toast.promise(
                api.post('expenses', expenseForm),
                {
                    loading: 'Logging expense...',
                    success: 'Expense logged successfully!',
                    error: 'Failed to log expense.'
                }
            );
            setShowExpenseModal(false);
            setExpenseForm({ title: '', amount: '', category: 'Maintenance', description: '' });
            refreshExpenses();
        } catch (err) {
            console.error(err);
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

    // Filter bills logic
    const filteredBills = (bills || []).filter(bill => {
        const matchesSearch = bill.house?.houseNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'ALL' || bill.status === statusFilter;
        const matchesUser = isAdmin || bill.houseId === profile?.houseId;
        return matchesSearch && matchesStatus && matchesUser;
    });

    return (
        <div className="space-y-6 md:space-y-8">
            <header className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-slate-900">{isAdmin ? 'Financials' : 'My Dues'}</h2>
                    <p className="text-slate-500 mt-1 text-sm md:text-base">{isAdmin ? 'Manage community billing and expenses.' : 'View your payment history and outstanding dues.'}</p>
                </div>
                {isAdmin && (
                    <button
                        onClick={() => setShowGenerateModal(true)}
                        disabled={genLoading}
                        className="bg-primary-600 text-white px-4 py-2 md:px-6 md:py-2.5 rounded-xl font-semibold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 flex items-center gap-2 disabled:opacity-50 text-sm md:text-base"
                    >
                        <Calendar size={18} />
                        {genLoading ? 'Generating...' : 'Generate New Cycle'}
                    </button>
                )}
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                {/* Billing Overview */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <h3 className="text-lg font-semibold text-slate-800">Recent Bills</h3>
                        <div className="flex flex-wrap items-center gap-3">
                            <div className="relative">
                                <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder="Search House..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none w-40"
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none appearance-none cursor-pointer"
                            >
                                <option value="ALL">All Status</option>
                                <option value="PAID">Paid</option>
                                <option value="UNPAID">Unpaid</option>
                            </select>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left min-w-[480px]">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm font-medium">
                                    <tr>
                                        <th className="px-4 md:px-6 py-3 md:py-4">House No</th>
                                        <th className="px-4 md:px-6 py-3 md:py-4">Month</th>
                                        <th className="px-4 md:px-6 py-3 md:py-4">Amount</th>
                                        <th className="px-4 md:px-6 py-3 md:py-4">Status</th>
                                        <th className="px-4 md:px-6 py-3 md:py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredBills.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="px-6 py-10 text-center text-slate-400 italic">No bills found matching filters.</td>
                                        </tr>
                                    ) : filteredBills.map((bill) => (
                                        <tr key={bill.id} className="hover:bg-slate-50 transition-colors">
                                            <td className="px-4 md:px-6 py-3 md:py-4 font-medium text-slate-700 text-sm">{bill.house?.houseNumber || 'N/A'}</td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 text-slate-500 text-sm">{new Date(bill.billingMonth).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</td>
                                            <td className="px-4 md:px-6 py-3 md:py-4 text-slate-700 font-semibold text-sm">${bill.amount}</td>
                                            <td className="px-4 md:px-6 py-3 md:py-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${bill.status === 'PAID' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                                                    }`}>
                                                    {bill.status}
                                                </span>
                                            </td>
                                            <td className="px-4 md:px-6 py-3 md:py-4">
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
                </div>

                {/* Expense Summary - Admin Only */}
                {isAdmin && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">Expense Ledger</h3>
                        </div>
                        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
                            <div className="max-h-[400px] overflow-y-auto pr-2 space-y-4">
                                {expenses?.length === 0 ? (
                                    <p className="text-center text-slate-400 py-10 italic">No expenses recorded yet.</p>
                                ) : expenses?.map((expense) => (
                                    <div key={expense.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-50 bg-slate-50/50 hover:border-slate-200 transition-all">
                                        <div>
                                            <p className="text-sm font-bold text-slate-800">{expense.title}</p>
                                            <p className="text-xs text-slate-400">{expense.category} • {new Date(expense.date).toLocaleDateString()}</p>
                                        </div>
                                        <p className="font-bold text-red-500">-${expense.amount}</p>
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={() => setShowExpenseModal(true)}
                                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-sm font-medium hover:border-primary-300 hover:text-primary-500 transition-all flex items-center justify-center gap-2"
                            >
                                <DollarSign size={16} />
                                Log New Expense
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Expense Modal */}
            {showExpenseModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 relative animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-bold text-slate-900 mb-6">Log New Expense</h3>
                        <form onSubmit={handleAddExpense} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                <input
                                    type="text"
                                    required
                                    placeholder="e.g. Security Salary"
                                    value={expenseForm.title}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Amount ($)</label>
                                    <input
                                        type="number"
                                        required
                                        placeholder="0.00"
                                        value={expenseForm.amount}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, amount: parseFloat(e.target.value) })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                                    <select
                                        value={expenseForm.category}
                                        onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                    >
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Utility">Utility</option>
                                        <option value="Salary">Salary</option>
                                        <option value="Misc">Misc</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                                <textarea
                                    rows="3"
                                    value={expenseForm.description}
                                    onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                ></textarea>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowExpenseModal(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
                                >
                                    Log Expense
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Generate Bill Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center px-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-8 relative animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-3 bg-primary-50 text-primary-600 rounded-xl">
                                <Calendar size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900">Generate Billing Cycle</h3>
                        </div>
                        <form onSubmit={generateBills} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Monthly Service Fee ($)</label>
                                <input
                                    type="number"
                                    required
                                    value={generateForm.amount}
                                    onChange={(e) => setGenerateForm({ ...generateForm, amount: e.target.value })}
                                    className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Billing Month</label>
                                    <input
                                        type="month"
                                        required
                                        value={generateForm.billingMonth}
                                        onChange={(e) => setGenerateForm({ ...generateForm, billingMonth: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                                    <input
                                        type="date"
                                        required
                                        value={generateForm.dueDate}
                                        onChange={(e) => setGenerateForm({ ...generateForm, dueDate: e.target.value })}
                                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                    />
                                </div>
                            </div>
                            <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl">
                                <p className="text-xs text-amber-700 leading-relaxed font-medium">
                                    <AlertCircle size={14} className="inline mr-1" />
                                    This will create un-paid bills for EVERY house in the society for the selected month. This action cannot be undone.
                                </p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowGenerateModal(false)}
                                    className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold hover:bg-slate-200 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={genLoading}
                                    className="flex-1 py-3 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-lg shadow-primary-200 disabled:opacity-50"
                                >
                                    {genLoading ? 'Processing...' : 'Confirm & Generate'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
