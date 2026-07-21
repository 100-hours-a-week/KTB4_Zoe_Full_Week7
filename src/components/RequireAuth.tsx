import type React from "react";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import { LoginPromptModal } from "@/components/LoginPromptModal";
import { useAuth } from "@/contexts/AuthContext";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { authStatus } = useAuth();
  const [modalOpen, setModalOpen] = useState(true);

  if (authStatus === "unknown") return null;
  if (authStatus === "authenticated") return <>{children}</>;

  return (
    <>
      <LoginPromptModal open={modalOpen} onClose={() => setModalOpen(false)} />
      {!modalOpen ? <Navigate to="/login" replace /> : null}
    </>
  );
}
