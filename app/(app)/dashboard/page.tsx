import { redirect } from "next/navigation";

// The app's home is Today. Keep /dashboard working for any old links.
export default function DashboardPage() {
  redirect("/today");
}
