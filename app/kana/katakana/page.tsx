import { KanaRowSections } from "@/components/kana/KanaRowSections";
import { requireUser } from "@/lib/auth";
import { getUserKana } from "@/lib/kana";

export default async function KatakanaPage() {
  const user = await requireUser();
  const kana = await getUserKana(user.id, "katakana");

  return <KanaRowSections kana={kana} type="katakana" />;
}
