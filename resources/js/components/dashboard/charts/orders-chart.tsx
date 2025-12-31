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

interface OrdersChartProps {
    data: Array<{
        status: string;
        count: number;
    }>;
}

const chartConfig = {
    count: {
        label: 'Orders',
        color: 'var(--chart-2)',
    },
} satisfies ChartConfig;

export function OrdersChart({ data }: OrdersChartProps) {
    const totalOrders = data.reduce((sum, item) => sum + item.count, 0);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Orders by Status</CardTitle>
                <CardDescription>
                    Total: {totalOrders.toLocaleString()} orders
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
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis
                            dataKey="status"
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <YAxis
                            tickLine={false}
                            axisLine={false}
                            tickMargin={8}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar
                            dataKey="count"
                            fill="var(--chart-2)"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
