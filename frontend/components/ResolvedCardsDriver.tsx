import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

const ResolvedCardsDrivers = () => {
  return (
    <div className="w-full md:w-72 grid grid-cols-2 md:grid-cols-1 gap-4">
      <Cards title="Ongoing" count={0} />
      <Cards title="Arriving" count={0} />
      <Cards title="Picked" count={0} />
      <Cards title="Reached" count={0} />
    </div>
  );
};

export default ResolvedCardsDrivers;

interface CardsProps {
  title: string;
  count: number;
}

const Cards = ({ title, count }: CardsProps) => {
  return (
    <Card className="">
      <CardHeader>
        <CardTitle className="text-sm md:text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>{count}</CardContent>
    </Card>
  );
};
