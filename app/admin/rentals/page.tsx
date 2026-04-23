/**
 * app/admin/rentals/page.tsx — placeholder
 * Redirects to existing admin/reservations for now.
 */
import { redirect } from "next/navigation";

export default function RentalsPage() {
  redirect("/admin/reservations");
}
