import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function Settings() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <Card>
        <CardHeader>
          <CardTitle>Admin Settings</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Add your settings form here */}
          <p>Update your admin settings here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
