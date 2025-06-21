import AmbulanceDriverContent from "@/components/AmbulanceDriverContent";
import AmbulanceHeader from "@/components/AmbulanceHeader";
import ResolvedCardsDriver from "@/components/ResolvedCardsDriver";

import { useRouter } from "next/router";

const Dashboard = () => {
  const router = useRouter();

  return (
    <div>
      <AmbulanceHeader />
      <div className="flex flex-col md:flex-row gap-5 justify-between p-5">
        <ResolvedCardsDriver />
        <AmbulanceDriverContent />
      </div>
    </div>
  );
};

export default Dashboard;
