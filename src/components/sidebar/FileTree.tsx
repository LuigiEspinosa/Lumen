import { FileEntry } from "../../lib/tauri";
import { FileTreeNode } from "./FileTreeNode";

interface Props {
  entries: FileEntry[];
  activePath: string | null;
  onSelect: (path: string) => void;
}

export function FileTree({ entries, activePath, onSelect }: Props) {
  if (entries.length === 0) {
    return (
      <div
        style={{
          padding: "16px 12px",
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-ui)",
          fontSize: "var(--font-size-sm)",
        }}
      >
        No Markdown files yet
      </div>
    );
  }

  return (
    <div role="tree" aria-label="File tree">
      {entries.map((entry) => (
        <FileTreeNode
          key={entry.path}
          entry={entry}
          depth={0}
          activePath={activePath}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
