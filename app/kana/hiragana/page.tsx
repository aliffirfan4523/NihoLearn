import { KanaRowSections } from "@/components/kana/KanaRowSections";
import { requireUser } from "@/lib/auth";
import { getUserKana } from "@/lib/kana";

export default async function HiraganaPage() {
  const user = await requireUser();
  const kana = await getUserKana(user.id, "hiragana");

  return <KanaRowSections kana={kana} type="hiragana" />;
}
