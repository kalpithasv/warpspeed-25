import Content from "@/components/Content";
import DoctorHeader from "@/components/DoctorHeader";
import ResolvedCards from "@/components/ResolvedCards";
import { useAuth } from "@/context";
import { useRouter } from "next/router";
import { useEffect } from "react";

const Dashboard = () => {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.push("/");
  }, [user]);
  return (
    <div>
      <DoctorHeader />
      <div className="flex flex-col justify-between gap-10 p-5 md:flex-row">
        <ResolvedCards />
        <Content />
      </div>
    </div>
  );
};

export default Dashboard;
