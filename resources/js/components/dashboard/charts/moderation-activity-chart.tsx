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
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

interface ModerationActivityChartProps {
    data: Array<{
        date: string;
        approved: number;
        rejected: number;
    }>;
}

const chartConfig = {
    approved: {
        label: 'Approved',
        color: 'var(--chart-2)',
    },
    rejected: {
        label: 'Rejected',
        color: 'var(--chart-5)',
    },
} satisfies ChartConfig;

export function ModerationActivityChart({
    data,
}: ModerationActivityChartProps) {
    const totalApproved = data.reduce((sum, item) => sum + item.approved, 0);
    const totalRejected = data.reduce((sum, item) => sum + item.rejected, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Moderation Activity</CardTitle>
                <CardDescription>
                    Last 14 days - {totalApproved} approved, {totalRejected}{' '}
                    rejected
                </CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer
                    config={chartConfig}
                    className="h-[300px] w-full"
                >
                    <BarChart
                        data={data}
                        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                    >
                        <CartesianGrid
                            strokeDasharray="3 3"
                            vertical={false}
                        />
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
                        <Bar
                            dataKey="approved"
                            fill="var(--chart-2)"
                            radius={[4, 4, 0, 0]}
                            stackId="a"
                        />
                        <Bar
                            dataKey="rejected"
                            fill="var(--chart-5)"
                            radius={[4, 4, 0, 0]}
                            stackId="a"
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
