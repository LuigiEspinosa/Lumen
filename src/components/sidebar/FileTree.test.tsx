import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { FileTree } from "./FileTree";
import type { FileEntry } from "../../lib/tauri";

// Provide a stable refreshTree mock so FileTreeNode rename/delete don't throw
vi.mock("../../stores/vault.ts", () => ({
  useVaultStore: () => vi.fn().mockResolvedValue(undefined),
}));

// Prevent rename/delete from calling invoke in tests
vi.mock("../../lib/tauri.ts", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/tauri")>();
  return {
    ...actual,
    fsApi: {
      renameFile: vi.fn().mockRejectedValue(undefined),
      deleteFile: vi.fn().mockRejectedValue(undefined),
    },
  };
});

const mockTree: FileEntry[] = [
  {
    name: "folder",
    path: "/vault/folder",
    is_dir: true,
    children: [
      {
        name: "nested.md",
        path: "/vault/folder/nested.md",
        is_dir: false,
        children: [],
      },
    ],
  },
  { name: "root.md", path: "/vault/root.md", is_dir: false, children: [] },
];

describe("FileTree", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders top-level directory and file nodes", () => {
    render(
      <FileTree entries={mockTree} activePath={null} onSelect={vi.fn()} />,
    );
    expect(screen.getByText("folder")).toBeInTheDocument();
    expect(screen.getByText("root.md")).toBeInTheDocument();
  });

  it("calls onSelect with file path when a file is clicked", async () => {
    const onSelect = vi.fn();
    render(
      <FileTree entries={mockTree} activePath={null} onSelect={onSelect} />,
    );
    await userEvent.click(screen.getByText("root.md"));
    expect(onSelect).toHaveBeenCalledWith("/vault/root.md");
  });

  it("marks the active file with aria-selected", () => {
    render(
      <FileTree
        entries={mockTree}
        activePath="/vault/root.md"
        onSelect={vi.fn()}
      />,
    );
    const node = screen.getByText("root.md").closest('[role="treeitem"]');
    expect(node).toHaveAttribute("aria-selected", "true");
  });

  it("hides nested children until folder is clicked", async () => {
    render(
      <FileTree entries={mockTree} activePath={null} onSelect={vi.fn()} />,
    );
    expect(screen.queryByText("nested.md")).not.toBeInTheDocument();
    await userEvent.click(screen.getByText("folder"));
    expect(screen.getByText("nested.md")).toBeInTheDocument();
  });

  it("shows empty state when entry list is empty", () => {
    render(<FileTree entries={[]} activePath={null} onSelect={vi.fn()} />);
    expect(screen.getByText("No Markdown files yet")).toBeInTheDocument();
  });
});
