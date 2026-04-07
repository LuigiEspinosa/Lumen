pub mod commands;
pub mod vault;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            commands::fs::list_dir,
            commands::fs::write_file,
            commands::fs::rename_file,
            commands::fs::delete_file,
            vault::open_vault,
            vault::get_last_vault,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
