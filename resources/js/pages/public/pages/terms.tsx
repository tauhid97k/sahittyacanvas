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

interface Section {
    heading: string;
    content: string;
}

interface Props {
    sections: Section[];
}

export default function TermsPage({ sections }: Props) {
    return (
        <PublicLayout
            title="নীতিমালা ও শর্তাবলী"
            description="সাহিত্য ক্যানভাস ব্যবহারের নীতিমালা ও শর্তাবলী"
        >
            <div className="container py-8">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">হোম</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>নীতিমালা ও শর্তাবলী</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="mx-auto max-w-3xl">
                    <h1 className="mb-8 text-3xl font-bold">
                        নীতিমালা ও শর্তাবলী
                    </h1>

                    {sections && sections.length > 0 ? (
                        <div className="space-y-6">
                            {sections.map((section, index) => (
                                <Card key={index}>
                                    <CardContent className="p-6">
                                        <h2 className="mb-4 text-xl font-semibold">
                                            {section.heading}
                                        </h2>
                                        <div
                                            className="prose dark:prose-invert max-w-none"
                                            dangerouslySetInnerHTML={{
                                                __html: section.content,
                                            }}
                                        />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-muted-foreground">
                                    নীতিমালা ও শর্তাবলী শীঘ্রই প্রকাশিত হবে।
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
