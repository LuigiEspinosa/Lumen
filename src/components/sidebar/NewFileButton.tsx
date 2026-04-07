import { useState } from "react";
import { fsApi } from "../../lib/tauri";
import { useVaultStore } from "../../stores/vault";

interface Props {
  vaultPath: string;
}

export function NewFileButton({ vaultPath }: Props) {
  const [inputting, setInputting] = useState(false);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const refreshTree = useVaultStore((s) => s.refreshTree);

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;

    // Always write with .md extension
    const filename = trimmed.endsWith(".md") ? trimmed : `${trimmed}.md`;

    // default to vault root - activeFolder tracking is added in a later phase
    const path = `${vaultPath}/${filename}`;
    try {
      await fsApi.writeFile(path, "");
      setInputting(false);
      setName("");
      setError(null);
      await refreshTree();
    } catch (e) {
      setError(String(e));
    }
  };

  if (!inputting) {
    return (
      <button
        onClick={() => {
          setName("");
          setError(null);
          setInputting(true);
        }}
        title="New file (creates at vault root)"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "4px",
          width: "100%",
          padding: "4px 8px",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "var(--color-text-secondary)",
          fontFamily: "var(--font-ui)",
          fontSize: "var(--font-size-sm)",
          textAlign: "left",
        }}
      >
        + New file
      </button>
    );
  }

  return (
    <div
      style={{
        padding: "4px 8px",
        display: "flex",
        flexDirection: "column",
        gap: "2px",
      }}
    >
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") handleCreate();
          if (e.key === "Escape") setInputting(false);
        }}
        placeholder="filename.md"
        style={{
          fontFamily: "var(--font-ui)",
          fontSize: "var(--font-size-sm)",
          background: "var(--color-bg-editor)",
          color: "var(--color-text-primary)",
          border: "1px solid var(--color-accent)",
          borderRadius: "var(--radius-sm)",
          padding: "2px 6px",
        }}
      />
      {error && (
        <span
          style={{
            color: "var(--color-status-dirty)",
            fontSize: "var(--font-size-xs)",
          }}
        >
          {error}
        </span>
      )}
    </div>
  );
}
