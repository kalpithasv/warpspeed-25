import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Analytics() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>
      <Card>
        <CardHeader>
          <CardTitle>Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add your analytics charts here */}
          <p>Sales, orders, and customer analytics will be displayed here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
