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

type userType = "doctor" | "ambulance" | string;

export default function Register() {
  const { toast } = useToast();
  const [userType, setUserType] = useState<userType>("");
  const [name, setName] = useState<string>("");

  const [username, setUsername] = useState<string>();
  const [password, setPassword] = useState<string>("");

  const [specialist, setSpecialist] = useState<string>("");
  const [address, setAddress] = useState<string>("");

  const [whatsappNumber, setWhatsappNumber] = useState<string>("");

  useEffect(() => {
    setUsername(name && userType && `${name.toLowerCase()}@${userType}.wd`);
  }, [name, userType]);

  function getPincodeFromAddress(address: string) {
    const pincodeRegex = /\b\d{6}\b/g;

    const matches = address.match(pincodeRegex);

    if (matches && matches.length > 0) {
      return matches[0];
    } else {
      return null;
    }
  }
  const createNewUser = async () => {
    if (!username || !password || !userType) return;

    createUserWithEmailAndPassword(auth, username, password)
      .then((userCred) => {
        const pincode = getPincodeFromAddress(address);
        setDoc(doc(db, userType, userCred.user?.uid), {
          specialist,
          pincode,
          name,
          userType,
          whatsappNumber,
          uid: userCred.user.uid,
          username,
          address,
        })
          .then(() => {
            toast({
              title: "Registered Successfully",
              description: new Date().toLocaleString(),
            });
          })
          .catch((err) => {
            toast({
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description:
                "There was a problem with Registering with us. (Database Error)",
            });
            console.log(err.message);
          });
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with Registering with us.",
        });

        console.log(err.message);
      });
  };

  return (
    <main
      className={`flex min-h-screen gap-10 px-10 md:px-0 flex-col items-center justify-center`}
    >
      <div className="fixed left-5 top-5">
        <Image
          height={200}
          width={200}
          className="h-20 w-15"
          src={require("@/public/assets/images/logo.png")}
        />
      </div>
      <Card className="w-full md:w-96">
        <CardHeader>
          <CardTitle>Register</CardTitle>
          <CardDescription>Please fill the following details</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <Input
            onChange={(e) => setName(e.target?.value)}
            type="text"
            placeholder="Name"
          />

          <Select
            onValueChange={(e) => {
              setUserType(e);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Admin Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="doctor">Doctor</SelectItem>
              <SelectItem value="ambulance">Ambulance Driver</SelectItem>
            </SelectContent>
          </Select>

          <Input
            type="text"
            value={name && userType && `${name.toLowerCase()}@${userType}.wd`}
            readOnly
            placeholder="Your Username"
          />
          {userType === "doctor" && (
            <>
              <Input
                type="text"
                onChange={(e) => setSpecialist(e.target?.value)}
                value={specialist}
                placeholder="Specialist in"
              />
              <Input
                type="text"
                onChange={(e) => setAddress(e.target?.value)}
                value={address}
                placeholder="Clinic/Hospital Address (with pincode)"
              />
            </>
          )}
          {userType === "ambulance" && (
            <>
              <Input
                type="text"
                onChange={(e) => setWhatsappNumber(e.target?.value)}
                placeholder="Whatsapp Number"
                value={whatsappNumber}
              />
            </>
          )}
          <Input
            type="password"
            onChange={(e) => setPassword(e.target?.value)}
            value={password}
            placeholder="Password"
          />

          <Button
            disabled={!userType || !name}
            onClick={createNewUser}
            className="w-full rounded-sm"
          >
            {userType == "doctor"
              ? "Register as Doctor"
              : userType == "ambulance"
              ? "Register as Ambulance Driver"
              : null}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
