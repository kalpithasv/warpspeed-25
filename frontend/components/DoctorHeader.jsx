import { useAuth } from "@/context";
import { Avatar, AvatarFallback } from "./ui/avatar";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
} from "./ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { signOut } from "firebase/auth";
import { auth } from "@/firebase";

const DoctorHeader = () => {
  const name = "Chanakyha";
  const { user } = useAuth();
  return (
    <div className="w-full bg-white shadow-sm px-10 sticky top-0 p-4 flex items-center justify-between border-b border-black/20">
      <h1 className="font-medium text-lg">WhatsupDoc</h1>
      <h1 className="hidden md:inline-flex text-xl font-bold">
        Doctor's Dashboard
      </h1>
      <div className="flex items-center  p-2 rounded-md gap-2">
        <div className="flex flex-col text-right">
          <h1 className="font-bold">{user?.name}</h1>
          <p className="text-xs">{user?.specialist} Specialist</p>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarFallback>
                {user?.name?.slice(0, 1).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <div className="flex p-2 py-4 items-center space-x-2">
              <Switch id="airplane-mode" />
              <Label htmlFor="airplane-mode">Available Mode</Label>
            </div>

            <DropdownMenuItem
              onClick={() => signOut(auth)}
              className="bg-red-500 text-white focus:bg-red-800 focus:text-white/90"
            >
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default DoctorHeader;
