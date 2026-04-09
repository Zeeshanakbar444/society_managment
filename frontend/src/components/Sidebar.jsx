import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, CreditCard, MessageSquare, LogOut, Home, BarChart3, User, FileText } from 'lucide-react';
import { auth } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

const adminItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Home, label: 'Infrastructure', path: '/infrastructure' },
    { icon: Users, label: 'Residents', path: '/residents' },
    { icon: CreditCard, label: 'Billing & Dues', path: '/billing' },
    { icon: MessageSquare, label: 'Complaints', path: '/complaints' },
    { icon: BarChart3, label: 'Reports', path: '/reports' },
    { icon: BarChart3, label: 'users', path: '/users' },
];

const memberItems = [
    { icon: LayoutDashboard, label: 'My Dashboard', path: '/' },
    { icon: CreditCard, label: 'My Dues', path: '/billing' },
    { icon: MessageSquare, label: 'Complaints', path: '/complaints' },
    { icon: FileText, label: 'My Ledger', path: '/ledger' },
    { icon: User, label: 'My Profile', path: '/profile' },
];

export default function Sidebar() {
    const location = useLocation();
    const { profile } = useAuth();

    const menuItems = profile?.role === 'ADMIN' ? adminItems : memberItems;

    return (
        <div className="w-64 h-full bg-white border-r border-slate-200 flex flex-col">
            <div className="p-6">
                <h1 className="text-xl font-bold text-primary-600">Society OS</h1>
                {profile && (
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">
                        {profile.role} ACCESS
                    </p>
                )}
            </div>

            <nav className="flex-1 px-4 space-y-1">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                    ? 'bg-primary-50 text-primary-600 font-medium'
                                    : 'text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            <item.icon size={20} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="p-4 border-t border-slate-200">
                <div className="px-4 py-3 mb-2">
                    <p className="text-xs font-bold text-slate-900 truncate">{profile?.fullName}</p>
                    <p className="text-[10px] text-slate-400 truncate">{profile?.email}</p>
                </div>
                <button
                    onClick={() => auth.signOut()}
                    className="flex items-center gap-3 px-4 py-3 w-full text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                >
                    <LogOut size={20} />
                    Logout
                </button>
            </div>
        </div>
    );
}
