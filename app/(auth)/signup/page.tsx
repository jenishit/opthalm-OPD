import { AuthShell } from "../_components/AuthShell";
import { SignupForm } from "../_components/SignupForm";

export const metadata = { title: "Create an account — Eye Clinic OPD" };

export default function SignupPage() {
  return (
    <AuthShell>
      <SignupForm />
    </AuthShell>
  );
}
