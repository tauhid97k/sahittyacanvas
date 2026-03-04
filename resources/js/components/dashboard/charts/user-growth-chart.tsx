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

interface UserGrowthChartProps {
    data: Array<{
        date: string;
        users: number;
    }>;
}

const chartConfig = {
    users: {
        label: 'New Users',
        color: 'var(--chart-4)',
    },
} satisfies ChartConfig;

export function UserGrowthChart({ data }: UserGrowthChartProps) {
    const totalNewUsers = data.reduce((sum, item) => sum + item.users, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>User Growth</CardTitle>
                <CardDescription>
                    Last 30 days - {totalNewUsers.toLocaleString()} new users
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
                                id="fillUsers"
                                x1="0"
                                y1="0"
                                x2="0"
                                y2="1"
                            >
                                <stop
                                    offset="5%"
                                    stopColor="var(--chart-4)"
                                    stopOpacity={0.8}
                                />
                                <stop
                                    offset="95%"
                                    stopColor="var(--chart-4)"
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
                            dataKey="users"
                            stroke="var(--chart-4)"
                            fill="url(#fillUsers)"
                            strokeWidth={2}
                        />
                    </AreaChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
