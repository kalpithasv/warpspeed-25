import { Avatar, AvatarFallback } from "./ui/avatar";

const DoctorHeader = () => {
  const name = "Chanakyha";
  return (
    <div className="w-full shadow-sm px-10 bg-white sticky top-0 p-4 flex items-center justify-between border-b border-black/20">
      <h1 className="font-medium text-lg">WhatsupDoc</h1>
      <h1 className="hidden md:inline-flex text-xl font-bold">
        Ambulance Driver's Dashboard
      </h1>
      <div className="flex items-center  p-2 rounded-md gap-2">
        <div className="flex flex-col text-right">
          <h1 className="font-bold">Chanakyha</h1>
          <p className="text-xs">+91 75501 48119</p>
        </div>
        <Avatar>
          <AvatarFallback>{name.slice(0, 1).toUpperCase()}</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default DoctorHeader;
