import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";

const ResolvedCards = () => {
  return (
    <div className="w-full md:w-72 grid grid-cols-2 md:grid-cols-1 gap-4">
      <Cards title="Ongoing" count={0} />
      <Cards title="Completed" count={0} />
      <Cards title="Cancelled" count={0} />
      <Cards title="No visit" count={0} />
    </div>
  );
};

export default ResolvedCards;

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
