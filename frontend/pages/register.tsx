import { auth, db } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { doc, setDoc } from "firebase/firestore";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import Image from "next/image";

type userType = "admin" | "support" | "inventory" | "sales" | string;

export default function Register() {
  const { toast } = useToast();
  const [userType, setUserType] = useState<userType>("");
  const [name, setName] = useState<string>("");
  const [username, setUsername] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [contactNumber, setContactNumber] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  // Auto-generate username (optional)
  useEffect(() => {
    if (name && userType) {
      setUsername(`${name.toLowerCase().replace(/\s+/g, '')}@${userType}.store`);
    }
  }, [name, userType]);

  function getPincodeFromAddress(address: string) {
    const pincodeRegex = /\b\d{6}\b/g;
    const matches = address.match(pincodeRegex);
    return matches && matches.length > 0 ? matches[0] : null;
  }

  const createNewUser = async () => {
  if (!username || !password || !userType) {
    toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong.",
      description: "Please fill all required fields.",
    });
    return;
  }
  if (password.length < 6) {
    toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong.",
      description: "Password must be at least 6 characters.",
    });
    return;
  }

  try {
    const userCred = await createUserWithEmailAndPassword(auth, username, password);
    const pincode = getPincodeFromAddress(address);
    await setDoc(doc(db, "users", userCred.user.uid), {
      name,
      userType,
      contactNumber,
      address,
      pincode,
      uid: userCred.user.uid,
      username,
    });
    toast({
      title: "Registered Successfully",
      description: new Date().toLocaleString(),
    });
  } catch (err: any) {
    let errorMessage = "There was a problem with registration.";
    if (err.code === "auth/email-already-in-use") {
      errorMessage = "This email address is already in use by another account.";
    } else if (err.code === "auth/weak-password") {
      errorMessage = "Password must be at least 6 characters.";
    }
    toast({
      variant: "destructive",
      title: "Uh oh! Something went wrong.",
      description: errorMessage,
    });
    console.error(err);
  }
};



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
          <CardTitle>Register</CardTitle>
          <CardDescription>Please fill the following details</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input
            onChange={(e) => setName(e.target.value)}
            type="text"
            placeholder="Name"
          />
          <Select onValueChange={setUserType}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="support">Support</SelectItem>
              <SelectItem value="inventory">Inventory Manager</SelectItem>
              <SelectItem value="sales">Sales Staff</SelectItem>
            </SelectContent>
          </Select>
          <Input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Username/Email"
          />
          <Input
            type="text"
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="Contact Number"
            value={contactNumber}
          />
          <Input
            type="text"
            onChange={(e) => setAddress(e.target.value)}
            value={address}
            placeholder="Full Address (with pincode)"
          />
          <Input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            placeholder="Password"
          />
          <Button
            disabled={!userType || !name}
            onClick={createNewUser}
            className="w-full rounded-sm"
          >
            Register
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
