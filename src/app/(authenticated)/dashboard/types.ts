import { LucideIcon } from "lucide-react"; // Assuming you're using Lucide for the icons

type MenuItemAction = {
  label: string;
  onClick: () => void;
  icon?: LucideIcon;
};

export type MenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType;
  actions?: MenuItemAction[];
};

export type Schedule = {
  startTime: string;
  endTime: string;
};

export type Schedules = Record<string, Schedule[]>;