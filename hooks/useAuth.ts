import { useState, useEffect } from 'react';
import { User, Role } from '../types';

const useAuth = () => {
    const [user, setUser] = useState<User | null>(() => {
        try {
            const item = window.sessionStorage.getItem('user');
            return item ? JSON.parse(item) : null;
        } catch (error) {
            return null;
        }
    });

    const login = (role: Role) => {
        const newUser: User = { role };
        window.sessionStorage.setItem('user', JSON.stringify(newUser));
        setUser(newUser);
    };

    const logout = () => {
        window.sessionStorage.removeItem('user');
        setUser(null);
    };

    return { user, login, logout };
};

export default useAuth;
