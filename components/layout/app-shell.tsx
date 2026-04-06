import { ReactNode } from "react";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { T } from "@/lib/tokens";

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", width: "100%", background: T.bg, overflow: "hidden" }}>
      <Header />
      <main style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>{children}</main>
      <Footer />
    </div>
  );
}
