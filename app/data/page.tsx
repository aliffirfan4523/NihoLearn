import { KanaDataEditor } from "@/components/data/KanaDataEditor";
import { requireUser } from "@/lib/auth";
import { getUserKana } from "@/lib/kana";

export default async function DataPage() {
  const user = await requireUser();
  const kana = await getUserKana(user.id);

  return <KanaDataEditor initialKana={kana} />;
}
