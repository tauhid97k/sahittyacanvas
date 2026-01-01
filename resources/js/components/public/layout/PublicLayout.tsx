import { Head } from '@inertiajs/react';
import { type ReactNode } from 'react';
import PublicFooter from './PublicFooter';
import PublicHeader from './PublicHeader';

interface PublicLayoutProps {
    children: ReactNode;
    title?: string;
    description?: string;
}

export default function PublicLayout({
    children,
    title,
    description,
}: PublicLayoutProps) {
    return (
        <>
            <Head
                title={
                    title ? `${title} - সাহিত্য ক্যানভাস` : 'সাহিত্য ক্যানভাস'
                }
            >
                {description && (
                    <meta name="description" content={description} />
                )}
            </Head>
            <div className="flex min-h-screen flex-col bg-background">
                <PublicHeader />
                <main className="flex-1">{children}</main>
                <PublicFooter />
            </div>
        </>
    );
}
