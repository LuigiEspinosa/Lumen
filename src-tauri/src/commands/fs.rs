use serde::{Deserialize, Serialize};
use std::fs;
use std::path::Path;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FileEntry {
    pub name: String,
    pub path: String,
    pub is_dir: bool,
    pub children: Vec<FileEntry>,
}

#[tauri::command]
pub fn list_dir(path: String) -> Result<Vec<FileEntry>, String> {
    read_entries(&path)
}

fn read_entries(path: &str) -> Result<Vec<FileEntry>, String> {
    let mut entries: Vec<FileEntry> = fs::read_dir(path)
        .map_err(|e| e.to_string())?
        .filter_map(|res| res.ok())
        .filter_map(|entry| {
            let p = entry.path();
            let name = p.file_name()?.to_str()?.to_string();
            if name.starts_with('.') {
                return None;
            }

            let is_dir = p.is_dir();
            // symlinks to directories are followed; cycles in symlink loops
            // will stack-overflow. Acceptable for a personal notes vault.
            if !is_dir && p.extension().map_or(true, |ext| ext != "md") {
                return None;
            }

            let children = if is_dir {
                read_entries(p.to_str()?).unwrap_or_default()
            } else {
                vec![]
            };

            Some(FileEntry {
                name,
                path: p.to_str()?.to_string(),
                is_dir,
                children,
            })
        })
        .collect();

    entries.sort_by(|a, b| match (a.is_dir, b.is_dir) {
        (true, false) => std::cmp::Ordering::Less,
        (false, true) => std::cmp::Ordering::Greater,
        _ => a.name.cmp(&b.name),
    });
    Ok(entries)
}

#[tauri::command]
pub fn write_file(path: String, content: String) -> Result<(), String> {
    if let Some(parent) = Path::new(&path).parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    fs::write(&path, content).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    // Fail explicitly so React can show an inline error in the rename input
    if Path::new(&new_path).exists() {
        return Err(format!(
            "'{}' already exists",
            Path::new(&new_path)
                .file_name()
                .unwrap_or_default()
                .to_string_lossy()
        ));
    }
    fs::rename(&old_path, &new_path).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_file(path: String) -> Result<(), String> {
    let p = Path::new(&path);
    if p.is_dir() {
        fs::remove_dir_all(p).map_err(|e| e.to_string())
    } else {
        fs::remove_file(p).map_err(|e| e.to_string())
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::File;
    use tempfile::tempdir;

    #[test]
    fn list_dir_shows_only_md_and_dirs() {
        let dir = tempdir().unwrap();
        File::create(dir.path().join("note.md")).unwrap();
        File::create(dir.path().join("ignored.txt")).unwrap();
        let entries = list_dir(dir.path().to_str().unwrap().to_string()).unwrap();
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].name, "note.md");
    }

    #[test]
    fn list_dir_dirs_come_before_files() {
        let dir = tempdir().unwrap();
        File::create(dir.path().join("alpha.md")).unwrap();
        fs::create_dir(dir.path().join("folder")).unwrap();
        let entries = list_dir(dir.path().to_str().unwrap().to_string()).unwrap();
        assert!(entries[0].is_dir, "directory should sort before files");
        assert!(!entries[1].is_dir);
    }

    #[test]
    fn list_dir_resources_into_subdirs() {
        let dir = tempdir().unwrap();
        let sub = dir.path().join("sub");
        fs::create_dir(&sub).unwrap();
        File::create(sub.join("nested.md")).unwrap();
        let entries = list_dir(dir.path().to_str().unwrap().to_string()).unwrap();
        assert_eq!(entries.len(), 1);
        assert_eq!(entries[0].children.len(), 1);
        assert_eq!(entries[0].children[0].name, "nested.md");
    }

    #[test]
    fn rename_file_rejects_existing_target() {
        let dir = tempdir().unwrap();
        let a = dir.path().join("a.md");
        let b = dir.path().join("b.md");
        File::create(&a).unwrap();
        File::create(&b).unwrap();
        let result = rename_file(
            a.to_str().unwrap().to_string(),
            b.to_str().unwrap().to_string(),
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().contains("already exists"));
    }
}
