import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface PostViewsChartProps {
    data: Array<{
        date: string;
        posts: number;
    }>;
}

const chartConfig = {
    posts: {
        label: 'Posts',
        color: 'var(--chart-3)',
    },
} satisfies ChartConfig;

export function PostViewsChart({ data }: PostViewsChartProps) {
    const totalPosts = data.reduce((sum, item) => sum + item.posts, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Posts Published</CardTitle>
                <CardDescription>
                    Last 30 days - Total: {totalPosts.toLocaleString()} posts
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                >
                    <AreaChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient
                                id="fillViews"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--chart-3)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--chart-3)"
                                    stopOpacity={0.1}
                                />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="date"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                            tickFormatter={(value) => value.slice(0, 6)}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Area
                            type="monotone"
                            dataKey="posts"
                            stroke="var(--chart-3)"
                            fill="url(#fillViews)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
