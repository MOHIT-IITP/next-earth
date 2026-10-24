import { Metadata } from "next";
import { SiteHeader } from "@/components/layout/site-header";
import { DesignSystemView } from "@/features/preview/design-system-view";

export const metadata: Metadata = {
  title: "Design System — Earth",
  description: "Earth Design System and Component Primitives showcase",
};

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />
      <main>
        <DesignSystemView />
      </main>
    </div>
  );
}
