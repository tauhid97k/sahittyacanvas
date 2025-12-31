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
    title: string;
    sections: Section[];
}

export default function RulesPage({ title, sections }: Props) {
    return (
        <PublicLayout title={title} description={`সাহিত্য ক্যানভাসের ${title}`}>
            <div className="container py-8">
                <Breadcrumb className="mb-6">
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/">হোম</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>{title}</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>

                <div className="mx-auto max-w-3xl">
                    <h1 className="mb-8 text-3xl font-bold">{title}</h1>

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
                                    নীতিমালা শীঘ্রই প্রকাশিত হবে।
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </PublicLayout>
    );
}
