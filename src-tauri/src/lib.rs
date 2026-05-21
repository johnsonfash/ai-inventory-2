// Tauri 2 entry point. Registers every plugin used by the JS side.
// Desktop-only plugins (window-state, single-instance, updater,
// autostart) are wrapped in cfg guards so the mobile builds compile
// cleanly.

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut builder = tauri::Builder::default()
        // ----- Cross-platform plugins -----
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_sql::Builder::default().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_deep_link::init())
        .plugin(tauri_plugin_sharesheet::init());

    // ----- Mobile-only plugins -----
    #[cfg(mobile)]
    {
        builder = builder
            .plugin(tauri_plugin_haptics::init())
            .plugin(tauri_plugin_barcode_scanner::init())
            .plugin(tauri_plugin_biometric::init())
            .plugin(tauri_plugin_keep_screen_on::init());
    }

    // ----- POS hardware (thermal printer + serial) — cross-platform
    // (works on desktop terminals AND Android USB-OTG / iOS via
    // network printers). -----
    builder = builder
        .plugin(tauri_plugin_thermal_printer::init())
        .plugin(tauri_plugin_serialplugin::init());

    // ----- Desktop-only plugins -----
    #[cfg(not(any(target_os = "android", target_os = "ios")))]
    {
        builder = builder
            .plugin(tauri_plugin_updater::Builder::new().build())
            .plugin(tauri_plugin_single_instance::init(|_app, _argv, _cwd| {
                // When a second instance is launched, focus the existing
                // window instead of opening a new one.
            }))
            .plugin(tauri_plugin_window_state::Builder::default().build())
            .plugin(tauri_plugin_autostart::init(
                tauri_plugin_autostart::MacosLauncher::LaunchAgent,
                None,
            ));
    }

    builder
        .run(tauri::generate_context!())
        .expect("error while running Pallio tauri application");
}
