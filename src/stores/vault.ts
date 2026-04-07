import { create } from "zustand";
import { fsApi, vaultApi, FileEntry } from "../lib/tauri";

interface VaultStage {
  vaultPath: string | null;
  tree: FileEntry[];
  activePath: string | null;
  loading: boolean;
  error: string | null;
  openVault: (path: string) => Promise<void>;
  loadLastVault: () => Promise<void>;
  refreshTree: () => Promise<void>;
  setActivePath: (path: string) => void;
}

export const useVaultStore = create<VaultStage>((set, get) => ({
  vaultPath: null,
  tree: [],
  activePath: null,
  loading: false,
  error: null,

  openVault: async (path) => {
    set({ loading: true, error: null });
    try {
      await vaultApi.open(path);
      const tree = await fsApi.listDir(path);
      set({ vaultPath: path, tree, loading: false });
    } catch (e) {
      set({ loading: false, error: String(e) });
    }
  },

  loadLastVault: async () => {
    set({ loading: true });
    try {
      const path = await vaultApi.getLast();
      if (path) {
        // load tree before transitioning to Screen 02 to prevent empty-sidebar flash
        const tree = await fsApi.listDir(path);
        set({ vaultPath: path, tree, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      // Remembered vault can't be loaded; fall back to Screen 01 silently
      set({ loading: false, error: null });
    }
  },

  refreshTree: async () => {
    const { vaultPath } = get();
    if (!vaultPath) return;
    const tree = await fsApi.listDir(vaultPath);
    set({ tree });
  },

  setActivePath: (path) => set({ activePath: path }),
}));
