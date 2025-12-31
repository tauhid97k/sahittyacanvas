import PublicLayout from '@/components/public/layout/PublicLayout';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { BookOpen, Heart, Palette, Users } from 'lucide-react';

export default function AboutPage() {
    return (
        <PublicLayout
            title="আমাদের সম্পর্কে"
            description="সাহিত্য ক্যানভাস - বাংলা সাহিত্যের অনলাইন প্ল্যাটফর্ম"
        >
            {/* Hero Section */}
            <section className="bg-gradient-to-br from-primary/10 via-background to-background py-16">
                <div className="container">
                    <Breadcrumb className="mb-6">
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbLink href="/">হোম</BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                            <BreadcrumbItem>
                                <BreadcrumbPage>আমাদের সম্পর্কে</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>

                    <div className="mx-auto max-w-3xl text-center">
                        <h1 className="text-4xl font-bold">সাহিত্য ক্যানভাস</h1>
                        <p className="mt-4 text-xl text-muted-foreground">
                            বাংলা সাহিত্যের অনলাইন প্ল্যাটফর্ম
                        </p>
                    </div>
                </div>
            </section>

            {/* Mission Section */}
            <section className="py-16">
                <div className="container">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="mb-6 text-2xl font-bold">
                            আমাদের লক্ষ্য
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            সাহিত্য ক্যানভাস একটি মুক্ত, সৃজনশীল ও
                            অনুপ্রেরণাদায়ক প্ল্যাটফর্ম যেখানে বাংলা কবিতা,
                            গল্প, প্রবন্ধ ও অন্যান্য সাহিত্যকর্ম জীবিত হয়ে ওঠে।
                            আমরা বিশ্বাস করি প্রতিটি মানুষের মধ্যে একজন লেখক
                            লুকিয়ে আছে, এবং আমাদের লক্ষ্য হলো সেই লেখককে
                            প্রকাশের সুযোগ করে দেওয়া।
                        </p>
                        <p className="mt-4 text-lg text-muted-foreground">
                            আমরা চাই বাংলা ভাষা ও সাহিত্যকে ডিজিটাল যুগে আরও
                            সমৃদ্ধ করতে। নতুন লেখকদের উৎসাহিত করতে এবং পাঠকদের
                            সাথে তাদের সংযুক্ত করতে আমরা প্রতিশ্রুতিবদ্ধ।
                        </p>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="bg-muted/50 py-16">
                <div className="container">
                    <h2 className="mb-8 text-center text-2xl font-bold">
                        আমরা যা অফার করি
                    </h2>
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        <FeatureCard
                            icon={<BookOpen className="h-8 w-8" />}
                            title="সাহিত্য প্রকাশ"
                            description="আপনার কবিতা, গল্প, প্রবন্ধ ও অন্যান্য সাহিত্যকর্ম প্রকাশ করুন এবং পাঠকদের কাছে পৌঁছে দিন।"
                        />
                        <FeatureCard
                            icon={<Users className="h-8 w-8" />}
                            title="সম্প্রদায়"
                            description="লেখক ও পাঠকদের একটি সক্রিয় সম্প্রদায়ে যোগ দিন, মতামত বিনিময় করুন।"
                        />
                        <FeatureCard
                            icon={<Heart className="h-8 w-8" />}
                            title="প্রশংসা ও সমর্থন"
                            description="আপনার প্রিয় লেখকদের অনুসরণ করুন, তাদের লেখায় পছন্দ ও মন্তব্য করুন।"
                        />
                        <FeatureCard
                            icon={<Palette className="h-8 w-8" />}
                            title="সৃজনশীলতা"
                            description="বিভিন্ন ধরনের সাহিত্যকর্ম - কবিতা, ছোটগল্প, উপন্যাস, প্রবন্ধ সবকিছুর জন্য জায়গা।"
                        />
                    </div>
                </div>
            </section>

            {/* History Section */}
            <section className="py-16">
                <div className="container">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="mb-6 text-2xl font-bold">
                            আমাদের যাত্রা
                        </h2>
                        <p className="text-lg text-muted-foreground">
                            সাহিত্য ক্যানভাস শুরু হয়েছিল একটি সাধারণ স্বপ্ন
                            থেকে - বাংলা সাহিত্যকে ডিজিটাল প্ল্যাটফর্মে নিয়ে
                            আসা। আমরা বিশ্বাস করি যে প্রযুক্তি ও সাহিত্য একসাথে
                            চলতে পারে এবং নতুন প্রজন্মের কাছে বাংলা সাহিত্যের
                            সৌন্দর্য তুলে ধরতে পারে।
                        </p>
                        <p className="mt-4 text-lg text-muted-foreground">
                            আজ আমরা গর্বিত যে হাজার হাজার লেখক ও পাঠক আমাদের
                            প্ল্যাটফর্মে যুক্ত হয়েছেন এবং প্রতিদিন নতুন
                            সাহিত্যকর্ম প্রকাশিত হচ্ছে।
                        </p>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="bg-muted/50 py-16">
                <div className="container">
                    <div className="mx-auto max-w-3xl">
                        <h2 className="mb-6 text-2xl font-bold">
                            আমাদের মূল্যবোধ
                        </h2>
                        <ul className="space-y-4 text-lg text-muted-foreground">
                            <li className="flex items-start gap-3">
                                <span className="mt-1 text-primary">✦</span>
                                <span>
                                    <strong>সৃজনশীলতা:</strong> আমরা প্রতিটি
                                    লেখকের অনন্য কণ্ঠস্বরকে সম্মান করি এবং
                                    উৎসাহিত করি।
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1 text-primary">✦</span>
                                <span>
                                    <strong>অন্তর্ভুক্তি:</strong> সবার জন্য
                                    উন্মুক্ত - নতুন বা অভিজ্ঞ, সবাই স্বাগত।
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1 text-primary">✦</span>
                                <span>
                                    <strong>গুণমান:</strong> আমরা মানসম্পন্ন
                                    সাহিত্যকর্মকে অগ্রাধিকার দিই।
                                </span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="mt-1 text-primary">✦</span>
                                <span>
                                    <strong>সম্প্রদায়:</strong> পারস্পরিক
                                    সম্মান ও সহযোগিতার পরিবেশ বজায় রাখি।
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-16">
                <div className="container">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="text-2xl font-bold">আজই যোগ দিন</h2>
                        <p className="mt-4 text-muted-foreground">
                            আপনার সাহিত্যিক যাত্রা শুরু করুন সাহিত্য ক্যানভাসে।
                            লেখুন, পড়ুন, এবং বাংলা সাহিত্যের সমৃদ্ধ জগতে ডুব
                            দিন।
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-4">
                            <Link
                                href="/register"
                                className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                            >
                                নিবন্ধন করুন
                            </Link>
                            <Link
                                href="/posts"
                                className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                            >
                                লেখা পড়ুন
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </PublicLayout>
    );
}

function FeatureCard({
    icon,
    title,
    description,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
}) {
    return (
        <Card>
            <CardContent className="p-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {icon}
                </div>
                <h3 className="mb-2 font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}
