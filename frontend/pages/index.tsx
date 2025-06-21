import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/router";
import { auth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/components/ui/use-toast";
import Image from "next/image";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const loginfunc = async () => {
    if (password.length < 6) {
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: "Password must be at least 6 characters.",
      });
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, username, password);
      toast({
        title: "Login Successful",
        description: `${new Date().toLocaleString()}`,
      });
    } catch (err: any) {
      let errorMessage = "Invalid email or password.";
      if (err.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      }
      toast({
        variant: "destructive",
        title: "Uh oh! Something went wrong.",
        description: errorMessage,
      });
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user]);

  return (
    <main className="flex min-h-screen gap-10 px-10 md:px-0 flex-col items-center justify-center">
      <div className="fixed left-5 top-5">
        <Image
          height={200}
          width={200}
          className="h-20 w-15"
          src={require("@/public/assets/images/logo.png")}
          alt="Logo"
        />
      </div>
      <Card className="w-full md:w-96">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Login to your e-commerce admin panel</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input
            type="text"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username/Email"
          />
          <Input
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
          />
          <Button onClick={loginfunc} className="w-full rounded-sm">
            Login
          </Button>
          <Button
            onClick={() => router.push("/register")}
            variant={"outline"}
            className="w-full rounded-sm"
          >
            Register with us
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
