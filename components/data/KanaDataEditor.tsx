"use client";

import { useState } from "react";
import type { KanaCharacter, ProgressStatus } from "@/types";

type Draft = Pick<KanaCharacter, "id" | "character" | "type" | "romaji" | "row" | "status">;

const statuses: ProgressStatus[] = ["unlearned", "reviewing", "mastered"];

export function KanaDataEditor({ initialKana }: { initialKana: KanaCharacter[] }) {
  const [rows, setRows] = useState<Draft[]>(initialKana);
  const [message, setMessage] = useState("Ready to edit kana data.");

  function updateLocal(id: string, patch: Partial<Draft>) {
    setRows((current) => current.map((row) => (row.id === id ? { ...row, ...patch } : row)));
  }

  async function save(row: Draft) {
    setMessage(`Saving ${row.id}...`);
    const response = await fetch(`/api/kana/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row),
    });
    const result = (await response.json()) as { error: string | null };
    setMessage(result.error ?? `Saved ${row.id}.`);
  }

  async function remove(row: Draft) {
    setMessage(`Deleting ${row.id}...`);
    const response = await fetch(`/api/kana/${row.id}`, { method: "DELETE" });
    const result = (await response.json()) as { error: string | null };
    if (!result.error) {
      setRows((current) => current.filter((item) => item.id !== row.id));
    }
    setMessage(result.error ?? `Deleted ${row.id}.`);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-black/10 bg-white p-8 shadow-sm dark:border-white/20 dark:bg-[#1A1A1A]">
        <p className="text-sm font-semibold uppercase tracking-widest text-[#C84B31] dark:text-[#E85C40]">Data editor</p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#1A1A1A] dark:text-[#FAFAFA]">Kana Data Editor</h2>
        <p className="mt-4 text-[#6B6B6B] dark:text-[#A0A0A0]">Modify kana rows. Changes save through API routes.</p>
        <p className="mt-4 rounded-xl bg-[#FAFAF8] px-4 py-3 text-sm text-[#2D5F8A] dark:bg-[#2A2A2A] dark:text-[#4A86B8]">{message}</p>
      </section>

      <div className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm dark:border-white/20 dark:bg-[#1A1A1A]">
        <div className="max-h-[70vh] overflow-auto">
          <table className="w-full min-w-[900px] border-collapse text-sm [&_td:first-child]:sticky [&_td:first-child]:left-0 [&_td:first-child]:z-10 [&_td:first-child]:bg-white [&_td:first-child]:dark:bg-[#1A1A1A] [&_th:first-child]:sticky [&_th:first-child]:left-0 [&_th:first-child]:z-10">
            <thead className="sticky top-0 bg-[#FAFAF8] text-left text-[#6B6B6B] dark:bg-[#2A2A2A] dark:text-[#A0A0A0]">
              <tr>
                <th className="p-3">ID</th>
                <th className="p-3">Type</th>
                <th className="p-3">Row</th>
                <th className="p-3">Kana</th>
                <th className="p-3">Romaji</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} className="border-t border-black/5 dark:border-white/10">
                  <td className="p-3 font-mono text-xs text-[#6B6B6B] dark:text-[#A0A0A0]">{row.id}</td>
                  <td className="p-3">
                    <select value={row.type} onChange={(event) => updateLocal(row.id, { type: event.target.value as Draft["type"] })} className="rounded-lg border border-black/10 bg-white px-3 py-2 dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]">
                      <option value="hiragana">hiragana</option>
                      <option value="katakana">katakana</option>
                    </select>
                  </td>
                  <td className="p-3"><input value={row.row} onChange={(event) => updateLocal(row.id, { row: event.target.value })} className="w-24 rounded-lg border border-black/10 px-3 py-2 dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]" /></td>
                  <td className="p-3"><input value={row.character} onChange={(event) => updateLocal(row.id, { character: event.target.value })} className="w-24 rounded-lg border border-black/10 px-3 py-2 font-serif text-xl dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]" /></td>
                  <td className="p-3"><input value={row.romaji} onChange={(event) => updateLocal(row.id, { romaji: event.target.value })} className="w-28 rounded-lg border border-black/10 px-3 py-2 font-mono dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]" /></td>
                  <td className="p-3">
                    <select value={row.status} onChange={(event) => updateLocal(row.id, { status: event.target.value as ProgressStatus })} className="rounded-lg border border-black/10 bg-white px-3 py-2 dark:border-white/20 dark:bg-[#2A2A2A] dark:text-[#FAFAFA]">
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                  </td>
                  <td className="p-3">
                    <div className="flex gap-2">
                      <button type="button" onClick={() => save(row)} className="rounded-lg bg-[#2D5F8A] px-3 py-2 font-semibold text-white hover:bg-[#C84B31] dark:bg-[#4A86B8] dark:hover:bg-[#E85C40]">Save</button>
                      <button type="button" onClick={() => remove(row)} className="rounded-lg border border-red-200 px-3 py-2 font-semibold text-red-700 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-900/20">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
