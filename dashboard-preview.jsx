import React, { useState, useEffect } from "react";
import { Search, Circle } from "lucide-react";

/* Même code que src/, regroupé en un seul fichier UNIQUEMENT pour
   permettre l'aperçu ici. Dans ton vrai projet, garde les fichiers
   séparés (tokens.js, StatusBadge.jsx, ChildCard.jsx, ChildList.jsx,
   children.mock.js) — c'est meilleur pour la maintenance. */

const C = {
  ink: "#12172B", base: "#F5F6FB", surface: "#FFFFFF",
  primary: "#4A3FE0", primarySoft: "#EDEBFC", primaryDark: "#332AA6",
  success: "#178A66", successSoft: "#E4F5EF",
  warn: "#C8801C", warnSoft: "#FBF0DD",
  textMuted: "#6B7280", border: "#E5E7F0",
};
const font = { display: "'Space Grotesk', sans-serif", body: "'Inter', sans-serif", mono: "'IBM Plex Mono', monospace" };

const mockChildren = [
  { id: "child_001", firstName: "Fatou", lastName: "K.", age: 6, lastEntryNote: "1 crise signalée cette semaine", lastEntryDate: "2026-07-10T19:42:00Z", synthesisStatus: "brouillon" },
  { id: "child_002", firstName: "Yao", lastName: "M.", age: 9, lastEntryNote: "Observance traitement 100%", lastEntryDate: "2026-07-09T08:00:00Z", synthesisStatus: "valide" },
  { id: "child_003", firstName: "Awa", lastName: "D.", age: 4, lastEntryNote: "Sommeil agité 3 nuits/7", lastEntryDate: "2026-07-09T20:10:00Z", synthesisStatus: "brouillon" },
  { id: "child_004", firstName: "Koffi", lastName: "B.", age: 11, lastEntryNote: "Aucune crise ce mois-ci", lastEntryDate: "2026-07-07T08:10:00Z", synthesisStatus: "valide" },
];

async function getChildren() {
  return mockChildren; // ← à remplacer par un fetch() quand Dev 1 a fini
}

function StatusBadge({ status }) {
  const map = {
    brouillon: { bg: C.warnSoft, fg: C.warn, label: "Brouillon" },
    valide: { bg: C.successSoft, fg: C.success, label: "Validé" },
  };
  const s = map[status] ?? { bg: C.base, fg: C.textMuted, label: status };
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: s.bg, color: s.fg, fontFamily: font.body }}>
      <Circle size={6} fill={s.fg} stroke="none" />
      {s.label}
    </span>
  );
}

function formatDate(iso) {
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  return isToday
    ? `Auj. ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}`
    : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

function ChildCard({ child, onClick }) {
  const initials = `${child.firstName[0]}${child.lastName[0]}`;
  return (
    <button onClick={onClick} className="w-full text-left px-4 py-3.5 rounded-2xl flex items-center justify-between" style={{ background: C.surface, boxShadow: "0 1px 2px rgba(18,23,43,0.05)" }}>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-[13px] font-semibold" style={{ background: C.primarySoft, color: C.primaryDark, fontFamily: font.display }}>
          {initials}
        </div>
        <div>
          <div className="text-[13.5px] font-semibold" style={{ color: C.ink, fontFamily: font.display }}>
            {child.firstName} {child.lastName} <span className="font-normal text-[11.5px]" style={{ color: C.textMuted }}>· {child.age} ans</span>
          </div>
          <div className="text-[11.5px] mt-0.5" style={{ color: C.textMuted, fontFamily: font.body }}>{child.lastEntryNote}</div>
        </div>
      </div>
      <div className="flex flex-col items-end gap-1.5">
        <StatusBadge status={child.synthesisStatus} />
        <span className="text-[10px]" style={{ color: C.textMuted, fontFamily: font.mono }}>{formatDate(child.lastEntryDate)}</span>
      </div>
    </button>
  );
}

const FILTERS = ["Tous", "Brouillon", "Validé"];

export default function DashboardPreview() {
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("Tous");

  useEffect(() => {
    getChildren().then(setChildren).finally(() => setLoading(false));
  }, []);

  const filtered = children.filter((c) => {
    const matchesQuery = `${c.firstName} ${c.lastName}`.toLowerCase().includes(query.toLowerCase());
    const matchesFilter =
      filter === "Tous" ||
      (filter === "Brouillon" && c.synthesisStatus === "brouillon") ||
      (filter === "Validé" && c.synthesisStatus === "valide");
    return matchesQuery && matchesFilter;
  });

  return (
    <div className="min-h-screen py-10 px-4" style={{ background: "#E9EAF3", fontFamily: font.body }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@600;700&family=Inter:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap');`}</style>
      <div
        className="mx-auto rounded-[2.5rem] p-3 shadow-2xl"
        style={{ background: C.ink, width: 380 }}
      >
        <div className="rounded-[1.8rem] overflow-hidden flex flex-col" style={{ background: C.base, height: 700 }}>
          <div className="px-4 pt-4 pb-3" style={{ background: C.surface, borderBottom: `1px solid ${C.border}` }}>
            <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-xl" style={{ background: C.base }}>
              <Search size={15} color={C.textMuted} />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher un enfant…"
                className="text-[12.5px] bg-transparent outline-none flex-1"
                style={{ color: C.ink, fontFamily: font.body }}
              />
            </div>
            <div className="flex gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className="text-[11.5px] px-3 py-1.5 rounded-full font-medium"
                  style={{ background: filter === f ? C.primary : C.base, color: filter === f ? "#fff" : C.textMuted, fontFamily: font.body }}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-1 px-4 py-3 space-y-2.5 overflow-y-auto" style={{ background: C.base }}>
            {loading && <p className="text-center text-[12px] py-8" style={{ color: C.textMuted }}>Chargement…</p>}
            {!loading && filtered.length === 0 && (
              <p className="text-center text-[12px] py-8" style={{ color: C.textMuted }}>Aucun enfant ne correspond à cette recherche.</p>
            )}
            {!loading && filtered.map((child) => (
              <ChildCard key={child.id} child={child} onClick={() => alert(`Ouvrir la fiche de ${child.firstName}`)} />
            ))}
          </div>
        </div>
      </div>
      <p className="text-center text-[11px] mt-4" style={{ color: C.textMuted }}>
        Essaie de taper dans la recherche ou de changer de filtre — c'est du vrai code, pas une image.
      </p>
    </div>
  );
}
