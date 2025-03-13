"use client";

import Header from "@/components/header";
import Seeder from "@/components/seeder";
import { getSession } from "@/lib/auth-client";
import { useQuery } from "@tanstack/react-query";

export default function Home() {
  return (
    <div>
      <Header />
    </div>
  );
}
