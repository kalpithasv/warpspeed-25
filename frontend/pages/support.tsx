import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { getSarvamResponse } from "@/lib/sarvam";

export default function Support() {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");

  const handleSend = async () => {
    const response = await getSarvamResponse(message);
    setReply(response);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Support</h1>
      <Card>
        <CardHeader>
          <CardTitle>Chat with AI Support</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Type your message..."
            className="mb-4"
          />
          <Button onClick={handleSend}>Send</Button>
          {reply && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <p>{reply}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
