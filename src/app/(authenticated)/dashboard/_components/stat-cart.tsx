import { ReactNode } from "react";

interface StatCardProps {
  title: string;
  data: number | string;
  icon: ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, data, icon }) => {
  return (
    <div className="flex items-center gap-4 p-4 border rounded-lg shadow-sm bg-background">
      {/* bg-muted */}
      <div className="flex items-center justify-center w-12 h-12 border rounded-full">
        <span className="text-2xl">{icon}</span>
      </div>
      <div>
        <p className="text-sm text-gray-500 capitalize">{title}</p>
        <p className="text-2xl font-semibold">{data}</p>
      </div>
    </div>
  );
};

export default StatCard;