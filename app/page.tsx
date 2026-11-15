import { redirect } from "next/navigation";
import { auth } from "@/lib/auth/auth";

// Decide on the server so there is no blank flash or client-side redirect.
export default async function Home() {
  const session = await auth();
  redirect(session?.user ? "/dashboard" : "/login");
}
