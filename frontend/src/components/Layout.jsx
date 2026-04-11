import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout() {
    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden">
            <Sidebar />
            {/* On mobile, add top padding to account for the fixed top bar (48px) */}
            <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-[60px] md:pt-8">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
