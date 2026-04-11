import React from 'react';
import { useApi } from '../hooks/useApi';
import { useAuth } from '../context/AuthContext';
import { FileText, TrendingUp, TrendingDown, DollarSign, Receipt, Clock } from 'lucide-react';

export default function PersonalLedger() {
    const { profile } = useAuth();
    const { data: bills } = useApi('bills');
    const { data: expenses } = useApi('expenses');
    const { data: complaints } = useApi('complaints');

    // Filter data for current member
    const myBills = bills?.filter(b => b.houseId === profile?.houseId) || [];
    const myComplaints = complaints?.filter(c => c.userId === profile?.id) || [];
    const paidBills = myBills.filter(b => b.status === 'PAID');
    const unpaidBills = myBills.filter(b => b.status !== 'PAID');

    const totalPaid = paidBills.reduce((sum, b) => sum + Number(b.amount), 0);
    const totalUnpaid = unpaidBills.reduce((sum, b) => sum + Number(b.amount), 0);

    return (
        <div className="space-y-6 md:space-y-8">
            <header>
                <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Personal Ledger</h2>
                <p className="text-slate-500 mt-1 text-sm md:text-base">Your financial summary and payment history.</p>
            </header>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Total Paid</p>
                            <p className="text-2xl font-bold text-green-600">${totalPaid.toLocaleString()}</p>
                        </div>
                        <div className="bg-green-50 p-3 rounded-xl">
                            <TrendingUp className="text-green-600" size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{paidBills.length} payments made</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Outstanding</p>
                            <p className="text-2xl font-bold text-red-600">${totalUnpaid.toLocaleString()}</p>
                        </div>
                        <div className="bg-red-50 p-3 rounded-xl">
                            <TrendingDown className="text-red-600" size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">{unpaidBills.length} pending bills</p>
                </div>

                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-slate-500 text-sm font-medium">Complaints</p>
                            <p className="text-2xl font-bold text-primary-600">{myComplaints.length}</p>
                        </div>
                        <div className="bg-primary-50 p-3 rounded-xl">
                            <FileText className="text-primary-600" size={24} />
                        </div>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                        {myComplaints.filter(c => c.status === 'OPEN').length} open, {myComplaints.filter(c => c.status === 'CLOSED').length} resolved
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
                {/* Payment History */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Receipt className="text-green-500" size={20} />
                        Payment History
                    </h3>
                    <div className="space-y-3">
                        {paidBills.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No payments yet</p>
                        ) : (
                            paidBills.slice(0, 5).map(bill => (
                                <div key={bill.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                                    <div>
                                        <p className="font-medium text-slate-800">
                                            {new Date(bill.billingMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-slate-400">Paid on {bill.paidAt ? new Date(bill.paidAt).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">${bill.amount}</p>
                                        <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">PAID</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Pending Dues */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                        <Clock className="text-amber-500" size={20} />
                        Pending Dues
                    </h3>
                    <div className="space-y-3">
                        {unpaidBills.length === 0 ? (
                            <p className="text-slate-400 text-center py-8">No pending dues! 🎉</p>
                        ) : (
                            unpaidBills.map(bill => (
                                <div key={bill.id} className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                                    <div>
                                        <p className="font-medium text-slate-800">
                                            {new Date(bill.billingMonth).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}
                                        </p>
                                        <p className="text-xs text-slate-400">Due: {new Date(bill.dueDate).toLocaleDateString()}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-red-600">${bill.amount}</p>
                                        <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">{bill.status}</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {unpaidBills.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-slate-100">
                            <div className="flex justify-between items-center">
                                <span className="text-slate-600 font-medium">Total Due:</span>
                                <span className="text-xl font-bold text-red-600">${totalUnpaid.toLocaleString()}</span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
