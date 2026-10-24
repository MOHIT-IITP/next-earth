import { Metadata } from "next";
import { DashboardView } from "@/features/dashboard/dashboard-view";

export const metadata: Metadata = {
  title: "Dashboard — Earth",
  description: "Global observatory overview, active biomes, and field metrics",
};

export default function DashboardPage() {
  return <DashboardView />;
}
