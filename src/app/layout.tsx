import type { Metadata } from "next";
import { instrumentSans, instrumentSerif } from "@/lib/fonts";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/toast";
import { AuthProvider } from "@/features/auth/auth-context";
import { ProjectsProvider } from "@/features/projects/projects-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "Earth — Environmental Observatory & Research Workspace",
  description: "Earth: warm ivory, cream, terracotta, olive, and charcoal ecological workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${instrumentSans.variable} ${instrumentSerif.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-earth-terracotta/20 selection:text-earth-terracotta">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <ProjectsProvider>
              <TooltipProvider delayDuration={200}>
                {children}
                <Toaster position="bottom-right" />
              </TooltipProvider>
            </ProjectsProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
