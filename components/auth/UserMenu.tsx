import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { UserDropdownMenu } from "@/components/auth/UserDropdownMenu";

export async function UserMenu() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <Link
        href="/login"
        className="rounded-full bg-[#C84B31] px-5 py-2 text-sm font-semibold text-white transition hover:bg-[#b03e26] dark:bg-[#E85C40] dark:hover:bg-[#d44e33]"
      >
        Sign in
      </Link>
    );
  }

  return <UserDropdownMenu user={user} />;
}
