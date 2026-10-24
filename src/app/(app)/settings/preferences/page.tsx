import { Metadata } from "next";
import { PreferencesView } from "@/features/settings/preferences-view";

export const metadata: Metadata = {
  title: "Preferences — Earth",
  description: "Configure appearance, telemetry alerts, and observatory test states",
};

export default function PreferencesPage() {
  return <PreferencesView />;
}
