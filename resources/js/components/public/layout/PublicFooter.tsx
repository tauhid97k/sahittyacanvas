import AppLogo from '@/components/app-logo';
import { Link } from '@inertiajs/react';
import {
    Facebook,
    Instagram,
    Mail,
    MapPin,
    Phone,
    Twitter,
} from 'lucide-react';

export default function PublicFooter() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-t bg-card">
            {/* Main Footer */}
            <div className="container py-12">
                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
                    {/* Brand Section */}
                    <div className="space-y-4">
                        <Link href="/" className="inline-block">
                            <div className="h-10 w-auto">
                                <AppLogo />
                            </div>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                            একটি মুক্ত, সৃজনশীল ও অনুপ্রেরণাদায়ক প্ল্যাটফর্ম
                            যেখানে বাংলা কবিতা, গল্প, প্রবন্ধ ও অন্যান্য
                            সাহিত্যকর্ম জীবিত হয়ে ওঠে।
                        </p>
                        {/* Social Links */}
                        <div className="flex gap-3">
                            <a
                                href="https://facebook.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                            >
                                <Facebook className="h-4 w-4" />
                            </a>
                            <a
                                href="https://twitter.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                            >
                                <Twitter className="h-4 w-4" />
                            </a>
                            <a
                                href="https://instagram.com"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:bg-primary hover:text-primary-foreground"
                            >
                                <Instagram className="h-4 w-4" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold">
                            গুরুত্বপূর্ণ লিংকস
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/about"
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    আমাদের সম্পর্কে
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/posts"
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    ব্লগ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    যোগাযোগ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/authors"
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    খ্যাতিমান কবি/লেখক
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Categories */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold">
                            বিভাগসমূহ
                        </h3>
                        <ul className="space-y-2 text-sm">
                            <li>
                                <Link
                                    href="/posts"
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    কবিতা
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/posts"
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    গল্প
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/posts"
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    প্রবন্ধ
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/shop"
                                    className="text-muted-foreground transition-colors hover:text-foreground"
                                >
                                    কেনাকাটা
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="mb-4 text-sm font-semibold">যোগাযোগ</h3>
                        <ul className="space-y-3 text-sm">
                            <li className="flex items-start gap-2 text-muted-foreground">
                                <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>01717-171717</span>
                            </li>
                            <li className="flex items-start gap-2 text-muted-foreground">
                                <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>support@sahityacanvas.com</span>
                            </li>
                            <li className="flex items-start gap-2 text-muted-foreground">
                                <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                                <span>ঢাকা, বাংলাদেশ</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom Bar */}
            <div className="border-t">
                <div className="container flex flex-col items-center justify-between gap-4 py-4 sm:flex-row">
                    <p className="text-center text-sm text-muted-foreground">
                        © {currentYear} সাহিত্য ক্যানভাস। সর্বস্বত্ব সংরক্ষিত।
                    </p>
                    <div className="flex gap-4 text-sm">
                        <Link
                            href="/terms"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            নীতিমালা ও শর্তাবলী
                        </Link>
                        <Link
                            href="/privacy"
                            className="text-muted-foreground transition-colors hover:text-foreground"
                        >
                            গোপনীয়তা নীতি
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
