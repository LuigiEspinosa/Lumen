import { invoke } from "@tauri-apps/api/core";

export interface FileEntry {
  name: string;
  path: string;
  is_dir: boolean;
  children: FileEntry[];
}

export const fsApi = {
  listDir: (path: string) => invoke<FileEntry[]>("list_dir", { path }),
  writeFile: (path: string, content: string) =>
    invoke<void>("write_file", { path, content }),
  renameFile: (old_path: string, new_path: string) =>
    invoke<void>("rename_file", { old_path, new_path }),
  deleteFile: (path: string) => invoke<void>("delete_file", { path }),
};

export const vaultApi = {
  open: (path: string) => invoke<void>("open_vault", { path }),
  getLast: () => invoke<string | null>("get_last_vault"),
};
