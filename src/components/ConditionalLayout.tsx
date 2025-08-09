'use client'

import { usePathname } from 'next/navigation';
import Navbar from '@/components/Navbar/page';
import Footer from '@/components/Footer/page';

interface ConditionalLayoutProps {
    children: React.ReactNode;
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
    const pathname = usePathname();

    // Define routes that should not show navbar and footer
    const authRoutes = [
        '/auth/signup',
        '/auth/signin',
        '/auth/forgot-password',
        '/auth/reset-password'
    ];

    // Define dashboard routes that should not show navbar and footer
    const dashboardRoutes = [
        '/dashboard'
    ];

    // Check if current path is an auth route
    const isAuthRoute = authRoutes.includes(pathname);

    // Check if current path is a dashboard route (including nested routes)
    const isDashboardRoute = pathname.startsWith('/dashboard');

    // If it's an auth route or dashboard route, don't show navbar/footer
    if (isAuthRoute || isDashboardRoute) {
        return (
            <main id="main-content" className="min-h-screen" role="main">
                {children}
            </main>
        );
    }

    // Regular pages: include navbar and footer
    return (
        <>
            <Navbar />
            <main id="main-content" className="flex-grow" role="main">
                {children}
            </main>
            <Footer />
        </>
    );
}