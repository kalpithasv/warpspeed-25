import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/router";

export default function Products() {
  const router = useRouter();

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Products</h1>
      <Card>
        <CardHeader>
          <CardTitle>Product List</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add your product list table here */}
          <Button className="mt-4" onClick={() => router.push("/products/new")}>
            Add New Product
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
