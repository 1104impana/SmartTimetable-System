import React, { useState } from 'react';
import { Role } from '../types';

interface LoginPageProps {
    onLogin: (role: Role) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
    const [role, setRole] = useState<Role>('Student');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(role);
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="p-8 bg-white rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Welcome</h1>
                    <p className="text-gray-500">Sign in to the AI Timetable Generator</p>
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                            Select Your Role
                        </label>
                        <select
                            id="role"
                            value={role}
                            onChange={(e) => setRole(e.target.value as Role)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="Student">Student</option>
                            <option value="Faculty">Faculty</option>
                            <option value="Admin">Admin</option>
                        </select>
                    </div>
                    
                    {/* Dummy fields for a more realistic login feel */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                        <input type="text" placeholder="demo" disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"/>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input type="password" placeholder="••••••••" disabled className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md cursor-not-allowed"/>
                    </div>

                    <p className="text-xs text-center text-gray-500">For demonstration, only the role selection is functional.</p>

                    <button
                        type="submit"
                        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                    >
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
