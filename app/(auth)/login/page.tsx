import { Suspense } from "react";
import { AuthShell } from "../_components/AuthShell";
import { LoginForm } from "../_components/LoginForm";

export const metadata = { title: "Staff sign in — Eye Clinic OPD" };

export default function Login() {
  return (
    <AuthShell>
      {/* LoginForm reads ?callbackUrl, which needs a Suspense boundary. */}
      <Suspense fallback={null}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
