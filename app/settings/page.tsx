import { requireUser } from "@/lib/auth";
import { ProfileSettingsView } from "@/components/profile/ProfileSettingsView";

export const metadata = {
  title: "Settings | NihoLearn",
  description: "Configure your daily study targets, review JLPT levels, and preferences.",
};

export default async function SettingsPage() {
  const user = await requireUser();
  return <ProfileSettingsView user={user} />;
}
