import type React from "react";
import { Header } from "@/components/Header";

type LayoutProps = {
  children: React.ReactNode;
  narrow?: boolean;
  backTo?: string;
};

export function Layout({ children, narrow = false, backTo }: LayoutProps) {
  return (
    <div className="app-shell">
      <Header backTo={backTo} />
      <main className={narrow ? "page page--narrow" : "page"}>{children}</main>
    </div>
  );
}
