import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

interface Section {
    heading: string;
    content: string;
}

interface Props {
    filters: {
        tab: string;
    };
    rules: {
        seller_rules: Section[];
        author_rules: Section[];
        terms_of_service: Section[];
        privacy_policy: Section[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Rules', href: '/dashboard/rules' },
];

const tabs = [
    { id: 'seller-rules', label: 'Seller Rules' },
    { id: 'author-rules', label: 'Author Rules' },
    { id: 'terms-of-service', label: 'Terms of Service' },
    { id: 'privacy-policy', label: 'Privacy Policy' },
];

function RulesDisplay({
    sections,
    title,
    description,
}: {
    sections: Section[];
    title: string;
    description: string;
}) {
    if (sections.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>{description}</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">
                        No content has been added yet.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {sections.map((section, index) => (
                    <div key={index} className="space-y-2">
                        <h3 className="text-lg font-semibold">
                            {section.heading}
                        </h3>
                        <div className="whitespace-pre-wrap text-muted-foreground">
                            {section.content}
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default function RulesIndex({ filters, rules }: Props) {
    const [activeTab, setActiveTab] = useState(filters.tab);

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.get(
            '/dashboard/rules',
            { tab },
            { preserveState: true, preserveScroll: true },
        );
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Platform Rules" />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold">
                        Platform Rules & Policies
                    </h1>
                    <p className="text-muted-foreground">
                        View the rules, terms, and policies of the platform
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex flex-wrap gap-2 border-b pb-2">
                    {tabs.map((tab) => (
                        <Button
                            key={tab.id}
                            variant={activeTab === tab.id ? 'default' : 'ghost'}
                            size="sm"
                            onClick={() => handleTabChange(tab.id)}
                        >
                            {tab.label}
                        </Button>
                    ))}
                </div>

                {/* Seller Rules Tab */}
                {activeTab === 'seller-rules' && (
                    <RulesDisplay
                        sections={rules.seller_rules}
                        title="Seller Rules"
                        description="Guidelines and rules for sellers on the platform"
                    />
                )}

                {/* Author Rules Tab */}
                {activeTab === 'author-rules' && (
                    <RulesDisplay
                        sections={rules.author_rules}
                        title="Author Rules"
                        description="Guidelines and rules for authors on the platform"
                    />
                )}

                {/* Terms of Service Tab */}
                {activeTab === 'terms-of-service' && (
                    <RulesDisplay
                        sections={rules.terms_of_service}
                        title="Terms of Service"
                        description="Terms and conditions for using the platform"
                    />
                )}

                {/* Privacy Policy Tab */}
                {activeTab === 'privacy-policy' && (
                    <RulesDisplay
                        sections={rules.privacy_policy}
                        title="Privacy Policy"
                        description="How we handle your data and privacy"
                    />
                )}
            </div>
        </AppLayout>
    );
}
