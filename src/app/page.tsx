import { redirect } from "next/navigation";
import paths from "@/config/path";

export default function HomePage() {
	redirect(paths.client.home);
}
