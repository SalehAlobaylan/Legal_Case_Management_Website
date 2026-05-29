import { redirect } from "next/navigation";

export default function MonitoringDashboardRedirect() {
  redirect("/admin/dashboard?tab=ai-monitoring");
}
