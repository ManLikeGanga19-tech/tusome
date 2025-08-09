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
    const authRoutes = ['/auth/signup', '/auth/signin', '/auth/forgot-password', '/auth/reset-password'];

    // Check if current path is an auth route
    const isAuthRoute = authRoutes.includes(pathname);

    if (isAuthRoute) {
        // Auth pages: no navbar/footer, full height
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