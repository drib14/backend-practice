import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';
export const AuthContext = createContext();

const api = axios.create({ baseURL: 'http://localhost:5000/api' });

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));

    useEffect(() => {
        const interceptor = api.interceptors.request.use((config) => {
            if (token) config.headers['x-auth-token'] = token;
            return config;
        });
        return () => api.interceptors.request.eject(interceptor);
    }, [token]);

    useEffect(() => {
        if (token) api.get('/auth/me').then(res => setUser(res.data)).catch(() => { localStorage.removeItem('token'); setToken(null); setUser(null); });
    }, [token]);
    const login = async (data) => { const res = await api.post('/auth/login', data); localStorage.setItem('token', res.data.token); setToken(res.data.token); return true; };
    const register = async (data) => { const res = await api.post('/auth/register', data); localStorage.setItem('token', res.data.token); setToken(res.data.token); return true; };
    const logout = () => { localStorage.removeItem('token'); setToken(null); setUser(null); };
    const forgotPassword = async (email) => { const res = await api.post('/auth/forgot-password', { email }); return res.data.msg; };
    const resetPassword = async (token, password) => { const res = await api.post(`/auth/reset-password/${token}`, { password }); return res.data.msg; };
    return <AuthContext.Provider value={{ user, token, api, login, register, logout, forgotPassword, resetPassword }}>{children}</AuthContext.Provider>;
};