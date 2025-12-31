import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Link } from '@inertiajs/react';
import { Star, User } from 'lucide-react';

interface Review {
    id: number;
    rating: number;
    comment: string | null;
    user: string;
    user_avatar: string | null;
    product: string;
    product_slug: string;
    created_at: string;
}

interface RecentReviewsProps {
    reviews: Review[];
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`size-3 ${
                        star <= rating
                            ? 'fill-yellow-400 text-yellow-400'
                            : 'text-muted-foreground'
                    }`}
                />
            ))}
        </div>
    );
}

export function RecentReviews({ reviews }: RecentReviewsProps) {
    if (reviews.length === 0) {
        return null;
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <span>Recent Reviews</span>
                    <Link
                        href="/dashboard/product-reviews"
                        className="text-sm font-normal text-primary hover:underline"
                    >
                        View All
                    </Link>
                </CardTitle>
                <CardDescription>Latest product reviews</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {reviews.map((review) => (
                        <Link
                            key={review.id}
                            href={`/dashboard/products/${review.product_slug}`}
                            className="block rounded-lg border p-3 transition-colors hover:bg-muted"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex size-10 items-center justify-center rounded-full bg-muted">
                                        {review.user_avatar ? (
                                            <img
                                                src={review.user_avatar}
                                                alt={review.user}
                                                className="size-full rounded-full object-cover"
                                            />
                                        ) : (
                                            <User className="size-5 text-muted-foreground" />
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-medium">
                                            {review.user}
                                        </p>
                                        <StarRating rating={review.rating} />
                                    </div>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                    {review.created_at}
                                </span>
                            </div>
                            {review.comment && (
                                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                                    {review.comment}
                                </p>
                            )}
                            <p className="mt-1 text-xs text-primary">
                                {review.product}
                            </p>
                        </Link>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
