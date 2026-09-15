import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { FaTicketAlt } from 'react-icons/fa';

const Navbar = () => {
    // Get logged-in user info and logout function from auth context
    const { user, logout } = useContext(AuthContext);
    // Hook to programmatically navigate (used to redirect after logout)
    const navigate = useNavigate();

    // Log the user out and redirect to the login page
    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        // Top-level nav bar with dark background and shadow for elevation
        <nav className="bg-gray-900 shadow-lg">
            {/* Centered container that constrains content width and adds horizontal padding */}
            <div className="container mx-auto px-4">
                {/* Flex layout: stacked vertically on small screens, row on medium+ screens */}
                <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
                    {/* Brand/logo, links back to home */}
                    <Link to="/" className="text-white text-2xl font-bold flex items-center gap-2">
                        <FaTicketAlt /> Eventora
                    </Link>
                    {/* Right-side nav links container, wraps and centers on smaller screens */}
                    <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
                        {/* Always-visible link to browse events */}
                        <Link to="/" className="text-gray-200 hover:text-white transition cursor-pointer">Events</Link>

                        {/* Conditional rendering based on auth state */}
                        {user ? (
                            // Shown when a user is logged in
                            <>
                                {/* Admins go to /admin, regular users go to /dashboard */}
                                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'} className="text-gray-200 hover:text-white transition">Dashboard</Link>
                                {/* Logout button triggers handleLogout (logs out + redirects) */}
                                <button onClick={handleLogout} className="bg-gray-700 hover:bg-black text-white px-4 py-2 rounded-md transition">Logout</button>
                            </>
                        ) : (
                            // Shown when no user is logged in
                            <>
                                {/* Link to login page */}
                                <Link to="/login" className="text-gray-200 hover:text-white transition">Login</Link>
                                {/* Styled call-to-action button linking to registration page */}
                                <Link to="/register" className="bg-white text-gray-900 hover:bg-gray-100 px-4 py-2 rounded-md font-semibold transition">Sign Up</Link>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
