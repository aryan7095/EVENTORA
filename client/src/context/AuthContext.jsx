import React, { createContext, useState, useEffect } from 'react';
import api from '../utils/axios';

// Create the context object that will hold auth state and functions
export const AuthContext = createContext();

// Provider component that wraps the app and supplies auth state/functions to all children
export const AuthProvider = ({ children }) => {
    // Currently logged-in user's data (null if not logged in)
    const [user, setUser] = useState(null);
    // Tracks whether we're still checking localStorage for an existing session
    const [loading, setLoading] = useState(true);

    // On initial mount, check localStorage for a previously saved user session
    useEffect(() => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            // Restore user state from saved session data
            setUser(JSON.parse(userInfo));
        }
        // Done checking, allow the app to render
        setLoading(false);
    }, []);

    // Logs a user in via the API, then saves the returned user data + token
    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            // Special case: if the account needs OTP verification, throw the full response data
            // so the caller can detect this and redirect to the verification flow
            if (error.response?.data?.needsVerification) throw error.response.data;
            // Otherwise throw a generic error message
            throw error.response?.data?.message || 'Login failed';
        }
    };

    // Registers a new user; does NOT log them in automatically (likely requires OTP verification next)
    const register = async (name, email, password) => {
        try {
            const { data } = await api.post('/auth/register', { name, email, password });
            return data; // Returns { message, email }
        } catch (error) {
            throw error.response?.data?.message || 'Registration failed';
        }
    };

    // Verifies the OTP sent to the user's email; on success logs them in (same as login flow)
    const verifyOTP = async (email, otp) => {
        try {
            const { data } = await api.post('/auth/verify-otp', { email, otp });
            setUser(data);
            localStorage.setItem('userInfo', JSON.stringify(data));
            localStorage.setItem('token', data.token);
            return data;
        } catch (error) {
            throw error.response?.data?.message || 'OTP verification failed';
        }
    };

    // Logs the user out by clearing state and removing persisted session data
    const logout = () => {
        setUser(null);
        localStorage.removeItem('userInfo');
        localStorage.removeItem('token');
    };

    return (
        // Expose auth state and functions to all descendant components via context
        <AuthContext.Provider value={{ user, login, register, verifyOTP, logout, loading }}>
            {/* Avoid rendering children until we've finished checking for an existing session,
                preventing a flash of logged-out UI on page refresh */}
            {!loading && children}
        </AuthContext.Provider>
    );
};
