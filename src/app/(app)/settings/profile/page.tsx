import { Metadata } from "next";
import { ProfileView } from "@/features/settings/profile-view";

export const metadata: Metadata = {
  title: "Researcher Profile — Earth",
  description: "Manage your credentials and ecological identity",
};

export default function ProfilePage() {
  return <ProfileView />;
}
