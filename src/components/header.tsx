'use client';

import { useRouter, usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { useApp } from '@/context/app-context';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { storage } from '@/utils';

export default function Header() {
    const router = useRouter();
    const pathname = usePathname();
    const { state, actions } = useApp();
    const isAuthRoute = pathname?.startsWith('/auth') ?? false;
    const isHome = pathname === '/';

    const backToHome = () => {
        router.push('/');
    };

    const openAuthPage = () => {
        router.push('/auth');
    };

    const handleLogout = async () => {
        try {
            await axios.post('/api/auth/logout', {}, { withCredentials: true });
            await signOut({ redirect: false });
            actions.setUser(null);
            actions.setAuthenticated(false);
            storage.remove('user'); // Clear localStorage
            toast.success('Logged out successfully');
            window.location.href = '/auth';
        } catch (error) {
            toast.error('Failed to log out');
        }
    };

    return (
        <nav className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50 dark:bg-gray-900/80 dark:border-gray-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    {/* Logo */}
                    <div
                        className="flex items-center cursor-pointer"
                        onClick={backToHome}
                    >
                        <div className="bg-gradient-to-r from-blue-600 to-purple-600 w-8 h-8 rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-sm">O</span>
                        </div>
                        <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                            OpportunityHub
                        </span>
                    </div>

                    {/* Links + Auth button */}
                    <div className="flex items-center space-x-8">
                        {isHome && (
                            <>
                                <a
                                    href="#features"
                                    className="hidden md:flex text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                >
                                    Features
                                </a>
                                <a
                                    href="#testimonials"
                                    className="hidden md:flex text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                >
                                    Testimonials
                                </a>
                                <a
                                    href="#pricing"
                                    className="hidden md:flex text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
                                >
                                    Pricing
                                </a>
                            </>
                        )}
                        {!isAuthRoute && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={state.isAuthenticated ? handleLogout : openAuthPage}
                            >
                                {state.isAuthenticated ? 'Sign Out' : 'Sign In'}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}