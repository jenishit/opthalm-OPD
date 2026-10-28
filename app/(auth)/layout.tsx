import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

// Guards the auth routes: an already-signed-in staff member has no business
// on the login page, so send them straight to the console. Runs on the server
// so the redirect happens before any auth UI renders.
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (session?.user) {
    redirect("/queue");
  }

  return <>{children}</>;
}
