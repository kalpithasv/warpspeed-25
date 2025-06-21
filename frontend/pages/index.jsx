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

  const loginfunc = () => {
    signInWithEmailAndPassword(auth, username, password)
      .then((result) => {
        toast({
          title: "Login Successfully",
          description: `${new Date().toLocaleString()}`,
        });
        console.log(result);
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: err.message,
        });
        console.log(err);
      });
  };

  useEffect(() => {
    if (!user.username) return;

    if (user?.username.split("@")[1] === "doctor.wd") {
      router.push("/doctor/dashboard");
    } else if (user?.username.split("@")[1] === "ambulance.wd") {
      router.push("/driver/dashboard");
    }
  }, [user]);

  return (
    <main
      className={`flex min-h-screen gap-10 px-10 md:px-0 flex-col items-center justify-center`}
    >
      <div className="fixed left-5 top-5">
        <Image
          height={200}
          width={200}
          className="h-20 w-15 "
          src={require("@/public/assets/images/logo.png")}
        />
      </div>

      <Card className="w-full md:w-96">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Login using your ID and Password</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input
            type="text"
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username"
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
