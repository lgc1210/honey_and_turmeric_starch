import { redirect } from "next/navigation";
import paths from "@/config/path";

export default function AdminPage() {
	redirect(paths.admin.dashboard);
}
