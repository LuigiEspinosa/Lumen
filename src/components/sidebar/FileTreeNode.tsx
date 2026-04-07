import { useState, useRef, type KeyboardEvent } from "react";
import { FileEntry, fsApi } from "../../lib/tauri";
import { useVaultStore } from "../../stores/vault";

interface Props {
  entry: FileEntry;
  depth: number;
  activePath: string | null;
  onSelect: (path: string) => void;
}

export function FileTreeNode({ entry, depth, activePath, onSelect }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [renaming, setRenaming] = useState(false);
  const [renameValue, setRenameValue] = useState(entry.name);
  const [renameError, setRenameError] = useState<string | null>(null);

  const renameInputRef = useRef<HTMLInputElement>(null);
  const refreshTree = useVaultStore((s) => s.refreshTree);

  const isActive = activePath === entry.path;

  const handleClick = () => {
    if (entry.is_dir) {
      setExpanded((prev) => !prev);
    } else {
      onSelect(entry.path);
    }
  };

  const startRename = () => {
    setRenameValue(entry.name);
    setRenameError(null);
    setRenaming(true);
    setTimeout(() => renameInputRef.current?.select(), 0);
  };

  const commitRename = async () => {
    const trimmed = renameValue.trim();
    if (!trimmed || trimmed === entry.name) {
      setRenaming(false);
      return;
    }

    const dir = entry.path.substring(0, entry.path.lastIndexOf("/"));
    const newPath = `${dir}/${trimmed}`;
    try {
      await fsApi.renameFile(entry.path, newPath);
      setRenaming(false);
      await refreshTree();
    } catch (e) {
      // Rust returned "already exists" - show inline error, keep input open.
      setRenameError(String(e));
    }
  };

  const handleRenameKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitRename();
    if (e.key === "Escape") setRenaming(false);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleClick();
    }

    if (e.key === "F2") {
      e.preventDefault();
      startRename();
    }

    if (e.key === "Delete") {
      e.preventDefault();
      if (window.confirm(`Delete "${entry.name}"?`)) {
        fsApi.deleteFile(entry.path).then(() => refreshTree());
      }
    }
  };

  const indent = depth * 16;

  return (
    <>
      <div
        role="treeitem"
        aria-expanded={entry.is_dir ? expanded : undefined}
        aria-selected={isActive}
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        style={{
          display: "flex",
          alignItems: "center",
          paddingLeft: `${indent + 8}px`,
          height: "24px",
          cursor: "pointer",
          background: isActive
            ? "var(--color-surface-active-file)"
            : "transparent",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-ui)",
          userSelect: "none",
          outline: "none",
          borderRadius: "var(--radius-sm)",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.outline = "1px solid var(--color-accent)")
        }
        onBlur={(e) => (e.currentTarget.style.outline = "none")}
      >
        <span
          style={{
            marginRight: "4px",
            opacity: 0.5,
            fontSize: "9px",
            minWidth: "10px",
          }}
        >
          {entry.is_dir ? (expanded ? "▾" : "▸") : "·"}
        </span>
        {renaming ? (
          <span
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <input
              ref={renameInputRef}
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              onKeyDown={handleRenameKey}
              onBlur={commitRename}
              style={{
                fontFamily: "var(--font-ui)",
                fontSize: "var(--font-size-sm)",
                background: "var(--color-bg-editor)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-accent)",
                borderRadius: "var(--radius-sm)",
                padding: "1px 4px",
                width: "100%",
              }}
            />
            {renameError && (
              <span
                style={{
                  color: "var(--color-status-dirty)",
                  fontSize: "var(--font-size-xs)",
                }}
              >
                {renameError}
              </span>
            )}
          </span>
        ) : (
          <span
            style={{
              flex: 1,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {entry.name}
          </span>
        )}
      </div>
      {entry.is_dir && expanded && (
        <div role="group">
          {entry.children.map((child) => (
            <FileTreeNode
              key={child.path}
              entry={child}
              depth={depth + 1}
              activePath={activePath}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </>
  );
}
