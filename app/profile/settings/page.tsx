import { requireUser } from "@/lib/auth";
import { ProfileSettingsView } from "@/components/profile/ProfileSettingsView";

export const metadata = {
  title: "Profile Settings | NihoLearn",
  description: "Configure your daily study targets, review JLPT levels, and preferences.",
};

export default async function ProfileSettingsPage() {
  const user = await requireUser();
  return <ProfileSettingsView user={user} />;
}
