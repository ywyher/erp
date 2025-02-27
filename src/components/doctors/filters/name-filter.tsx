"use client";

import { Input } from "@/components/ui/input";
import { useQueryState } from "nuqs";

export default function NameFilter() {
  const [name, setName] = useQueryState("name");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  return (
    <Input
      type="text"
      placeholder="Search by Full Name or Username"
      value={name || ""}
      onChange={handleInputChange}
    />
  );
}
