use serde::{Deserialize, Serialize};
use std::fs;
use std::path::{Path, PathBuf};

#[derive(Debug, Serialize, Deserialize, Default)]
struct VaultConfig {
    last_vault: Option<String>,
}

fn config_path() -> Result<PathBuf, String> {
    // Guard against None from dirs::config_local_dir in minimal WSL environments
    // where $XDG_CONFIG_HOME and $HOME are unset.
    dirs::config_local_dir()
        .ok_or_else(|| "Cannot locate config directory. Set $XDG_CONFIG_HOME or $HOME.".to_string())
        .map(|d| d.join("lumen").join("vault.toml"))
}

#[tauri::command]
pub fn open_vault(path: String) -> Result<(), String> {
    let p = PathBuf::from(&path);
    if !p.exists() || !p.is_dir() {
        return Err(format!("'{}' is not an accessible directory", path));
    }

    let cfg = config_path()?;
    fs::create_dir_all(cfg.parent().unwrap()).map_err(|e| e.to_string())?;

    let contents = toml::to_string(&VaultConfig {
        last_vault: Some(path),
    })
    .map_err(|e| e.to_string())?;
    fs::write(&cfg, contents).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_last_vault() -> Result<Option<String>, String> {
    let cfg = config_path()?;
    if !cfg.exists() {
        return Ok(None);
    }

    let raw = fs::read_to_string(&cfg).map_err(|e| e.to_string())?;
    let parsed: VaultConfig = toml::from_str(&raw).map_err(|e| e.to_string())?;

    // Silently discard paths that no longer exist on disk (deleted dir, unmounted drive).
    // Return None so the app shows Screen 01 instead of throwing a list_dir error.
    Ok(match parsed.last_vault {
        Some(ref p) if Path::new(p).exists() => Some(p.clone()),
        _ => None,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn open_vault_rejects_nonexistent_path() {
        let result = open_vault("/tmp/lumen_test_vault_nonexistent_xyz".to_string());
        assert!(result.is_err());
    }

    #[test]
    fn open_vault_rejects_file_path() {
        let dir = tempfile::tempdir().unwrap();
        let file = dir.path().join("not_a_dir.md");
        std::fs::File::create(&file).unwrap();
        let result = open_vault(file.to_str().unwrap().to_string());
        assert!(result.is_err());
    }
}
