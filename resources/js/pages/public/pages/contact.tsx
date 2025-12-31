import PublicLayout from '@/components/public/layout/PublicLayout';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useForm } from '@inertiajs/react';
import { Mail, MapPin, Phone } from 'lucide-react';

export default function ContactPage() {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/contact', {
            onSuccess: () => reset(),
        });
    };

    return (
        <PublicLayout
            title="যোগাযোগ"
            description="সাহিত্য ক্যানভাসের সাথে যোগাযোগ করুন"
        >
            <div className="container py-8">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">হোম</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>যোগাযোগ</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="mx-auto max-w-5xl">
                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-bold">যোগাযোগ করুন</h1>
                        <p className="mt-2 text-muted-foreground">
                            আমাদের সাথে যোগাযোগ করতে নিচের ফর্মটি পূরণ করুন
                        </p>
                    </div>

                    <div className="grid gap-8 lg:grid-cols-3">
                        {/* Contact Info */}
                        <div className="space-y-4">
                            <ContactInfoCard
                                icon={<Phone className="h-5 w-5" />}
                                title="ফোন"
                                content="01717-171717"
                            />
                            <ContactInfoCard
                                icon={<Mail className="h-5 w-5" />}
                                title="ইমেইল"
                                content="support@sahityacanvas.com"
                            />
                            <ContactInfoCard
                                icon={<MapPin className="h-5 w-5" />}
                                title="ঠিকানা"
                                content="ঢাকা, বাংলাদেশ"
                            />
                        </div>

                        {/* Contact Form */}
                        <Card className="lg:col-span-2">
                            <CardContent className="p-6">
                                <form
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">নাম *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) =>
                                                    setData(
                                                        'name',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="আপনার নাম"
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-destructive">
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="email">
                                                ইমেইল *
                                            </Label>
                                            <Input
                                                id="email"
                                                type="email"
                                                value={data.email}
                                                onChange={(e) =>
                                                    setData(
                                                        'email',
                                                        e.target.value,
                                                    )
                                                }
                                                placeholder="আপনার ইমেইল"
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-destructive">
                                                    {errors.email}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="subject">বিষয় *</Label>
                                        <Input
                                            id="subject"
                                            value={data.subject}
                                            onChange={(e) =>
                                                setData(
                                                    'subject',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="বার্তার বিষয়"
                                        />
                                        {errors.subject && (
                                            <p className="text-sm text-destructive">
                                                {errors.subject}
                                            </p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="message">
                                            বার্তা *
                                        </Label>
                                        <Textarea
                                            id="message"
                                            value={data.message}
                                            onChange={(e) =>
                                                setData(
                                                    'message',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="আপনার বার্তা লিখুন..."
                                            rows={6}
                                        />
                                        {errors.message && (
                                            <p className="text-sm text-destructive">
                                                {errors.message}
                                            </p>
                                        )}
                                    </div>
                                    <Button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full"
                                    >
                                        {processing
                                            ? 'পাঠানো হচ্ছে...'
                                            : 'বার্তা পাঠান'}
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </PublicLayout>
    );
}

function ContactInfoCard({
    icon,
    title,
    content,
}: {
    icon: React.ReactNode;
    title: string;
    content: string;
}) {
    return (
        <Card>
            <CardContent className="flex items-center gap-4 p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {icon}
                </div>
                <div>
                    <p className="text-sm text-muted-foreground">{title}</p>
                    <p className="font-medium">{content}</p>
                </div>
            </CardContent>
        </Card>
    );
}
