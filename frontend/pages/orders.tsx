import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

export default function Orders() {
  const router = useRouter();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Orders</h1>
      <Card>
        <CardHeader>
          <CardTitle>Order List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add your order list table here */}
          <Button className="mt-4" onClick={() => router.push("/orders/new")}>
            Create New Order
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
