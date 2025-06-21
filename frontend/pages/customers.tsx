import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/router";

export default function Customers() {
  const router = useRouter();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Customers</h1>
      <Card>
        <CardHeader>
          <CardTitle>Customer List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add your customer list table here */}
          <Button className="mt-4" onClick={() => router.push("/customers/new")}>
            Add New Customer
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
