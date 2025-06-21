import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context";
import { useRouter } from "next/router";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";

export default function Dashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (err) {
      console.error("Error signing out", err);
    }
  };

  if (!user) {
    router.push("/");
    return null;
  }

  return (
    <div className="p-8">
      <nav className="flex gap-4 mb-6">
        <Button variant="ghost" onClick={() => router.push("/dashboard")}>Dashboard</Button>
        <Button variant="ghost" onClick={() => router.push("/products")}>Products</Button>
        <Button variant="ghost" onClick={() => router.push("/orders")}>Orders</Button>
        <Button variant="ghost" onClick={() => router.push("/customers")}>Customers</Button>
        <Button variant="ghost" onClick={() => router.push("/support")}>Support</Button>
        <Button variant="ghost" onClick={() => router.push("/analytics")}>Analytics</Button>
        <Button variant="ghost" onClick={() => router.push("/settings")}>Settings</Button>
      </nav>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <Button onClick={handleLogout}>Logout</Button>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Products</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage your product inventory</p>
            <Button className="mt-4" onClick={() => router.push("/products")}>
              View Products
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View and manage customer orders</p>
            <Button className="mt-4" onClick={() => router.push("/orders")}>
              View Orders
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Manage customer information</p>
            <Button className="mt-4" onClick={() => router.push("/customers")}>
              View Customers
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
