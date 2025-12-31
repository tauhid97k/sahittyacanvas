import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface Section {
    heading: string;
    content: string;
}

interface Props {
    filters: {
        tab: string;
    };
    settings: {
        platform_commission_percentage: number;
        seller_rules: Section[];
        author_rules: Section[];
        terms_of_service: Section[];
        privacy_policy: Section[];
    };
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Settings', href: '/dashboard/settings' },
];

const tabs = [
    { id: 'platform', label: 'Platform' },
    { id: 'seller-rules', label: 'Seller Rules' },
    { id: 'author-rules', label: 'Author Rules' },
    { id: 'terms-of-service', label: 'Terms of Service' },
    { id: 'privacy-policy', label: 'Privacy Policy' },
];

function SectionsEditor({
    sections,
    onSave,
    saveUrl,
    title,
    description,
}: {
    sections: Section[];
    onSave: (sections: Section[]) => void;
    saveUrl: string;
    title: string;
    description: string;
}) {
    const [localSections, setLocalSections] = useState<Section[]>(
        sections.length > 0 ? sections : [{ heading: '', content: '' }],
    );
    const [saving, setSaving] = useState(false);

    const addSection = () => {
        setLocalSections([...localSections, { heading: '', content: '' }]);
    };

    const removeSection = (index: number) => {
        if (localSections.length > 1) {
            setLocalSections(localSections.filter((_, i) => i !== index));
        }
    };

    const updateSection = (
        index: number,
        field: 'heading' | 'content',
        value: string,
    ) => {
        const updated = [...localSections];
        updated[index][field] = value;
        setLocalSections(updated);
    };

    const handleSave = () => {
        setSaving(true);
        // Convert sections array to indexed object format for Laravel array validation
        const formData: Record<string, string> = {};
        localSections.forEach((section, index) => {
            formData[`sections[${index}][heading]`] = section.heading;
            formData[`sections[${index}][content]`] = section.content;
        });

        router.post(saveUrl, formData, {
            preserveScroll: true,
            onSuccess: () => {
                onSave(localSections);
                setSaving(false);
            },
            onError: () => setSaving(false),
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {localSections.map((section, index) => (
                    <div
                        key={index}
                        className="space-y-4 rounded-lg border p-4"
                    >
                        <div className="flex items-center justify-between">
                            <Label className="text-base font-medium">
                                Section {index + 1}
                            </Label>
                            {localSections.length > 1 && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeSection(index)}
                                >
                                    <Trash2 className="size-4" />
                                </Button>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`heading-${index}`}>Heading</Label>
                            <Input
                                id={`heading-${index}`}
                                value={section.heading}
                                onChange={(e) =>
                                    updateSection(
                                        index,
                                        'heading',
                                        e.target.value,
                                    )
                                }
                                placeholder="Enter section heading"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor={`content-${index}`}>Content</Label>
                            <Textarea
                                id={`content-${index}`}
                                value={section.content}
                                onChange={(e) =>
                                    updateSection(
                                        index,
                                        'content',
                                        e.target.value,
                                    )
                                }
                                placeholder="Enter section content"
                                rows={6}
                            />
                        </div>
                    </div>
                ))}

                <div className="flex items-center justify-between">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={addSection}
                    >
                        <Plus className="size-4" />
                        Add Section
                    </Button>
                    <Button onClick={handleSave} disabled={saving}>
                        <Save className="size-4" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}

export default function SettingsIndex({ filters, settings }: Props) {
    const [activeTab, setActiveTab] = useState(filters.tab);

    const commissionForm = useForm({
        percentage: settings.platform_commission_percentage,
    });

    const handleTabChange = (tab: string) => {
        setActiveTab(tab);
        router.get(
            '/dashboard/settings',
            { tab },
            { preserveState: true, preserveScroll: true },
        );
    };

    const handleCommissionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        commissionForm.post('/dashboard/settings/commission', {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Platform Settings" />

            <div className="flex flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-bold">Platform Settings</h1>
                    <p className="text-muted-foreground">
                        Manage platform configuration, rules, and policies
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

                {/* Platform Tab */}
                {activeTab === 'platform' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Platform Commission</CardTitle>
                            <CardDescription>
                                Set the commission percentage the platform takes
                                from each sale. All sellers will be notified
                                when this changes.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <form
                                onSubmit={handleCommissionSubmit}
                                className="space-y-4"
                            >
                                <div className="space-y-2">
                                    <Label htmlFor="percentage">
                                        Commission Percentage (%)
                                    </Label>
                                    <div className="flex items-center gap-2">
                                        <Input
                                            id="percentage"
                                            type="number"
                                            min="0"
                                            max="100"
                                            step="0.1"
                                            value={
                                                commissionForm.data.percentage
                                            }
                                            onChange={(e) =>
                                                commissionForm.setData(
                                                    'percentage',
                                                    parseFloat(
                                                        e.target.value,
                                                    ) || 0,
                                                )
                                            }
                                            className="w-32"
                                        />
                                        <span className="text-muted-foreground">
                                            %
                                        </span>
                                    </div>
                                    {commissionForm.errors.percentage && (
                                        <p className="text-sm text-destructive">
                                            {commissionForm.errors.percentage}
                                        </p>
                                    )}
                                </div>
                                <Button
                                    type="submit"
                                    disabled={commissionForm.processing}
                                >
                                    <Save className="size-4" />
                                    {commissionForm.processing
                                        ? 'Saving...'
                                        : 'Save Commission'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                )}

                {/* Seller Rules Tab */}
                {activeTab === 'seller-rules' && (
                    <SectionsEditor
                        sections={settings.seller_rules}
                        onSave={() => {}}
                        saveUrl="/dashboard/settings/seller-rules"
                        title="Seller Rules"
                        description="Define the rules and guidelines for sellers on the platform"
                    />
                )}

                {/* Author Rules Tab */}
                {activeTab === 'author-rules' && (
                    <SectionsEditor
                        sections={settings.author_rules}
                        onSave={() => {}}
                        saveUrl="/dashboard/settings/author-rules"
                        title="Author Rules"
                        description="Define the rules and guidelines for authors on the platform"
                    />
                )}

                {/* Terms of Service Tab */}
                {activeTab === 'terms-of-service' && (
                    <SectionsEditor
                        sections={settings.terms_of_service}
                        onSave={() => {}}
                        saveUrl="/dashboard/settings/terms-of-service"
                        title="Terms of Service"
                        description="Define the terms of service for the platform"
                    />
                )}

                {/* Privacy Policy Tab */}
                {activeTab === 'privacy-policy' && (
                    <SectionsEditor
                        sections={settings.privacy_policy}
                        onSave={() => {}}
                        saveUrl="/dashboard/settings/privacy-policy"
                        title="Privacy Policy"
                        description="Define the privacy policy for the platform"
                    />
                )}
            </div>
        </AppLayout>
    );
}
