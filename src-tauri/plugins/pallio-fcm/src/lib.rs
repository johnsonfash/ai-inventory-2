// Tauri plugin entry. Exposes `register_for_push`, `unregister`,
// and the `push-message` event. Mobile-only — on desktop, register
// returns Err so consumers can no-op.

use serde::{Deserialize, Serialize};
use tauri::{
    plugin::{Builder, TauriPlugin},
    Manager, Runtime,
};

#[derive(Debug, Serialize, Deserialize)]
pub struct PushToken {
    pub token: String,
    pub platform: String, // "ios" | "android"
}

#[tauri::command]
async fn register_for_push<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<PushToken, String> {
    #[cfg(target_os = "ios")]
    {
        // TODO: call into ios/PalliFcmPlugin.swift via the JS bridge.
        // For now, return a stub so the JS side has a place to wire.
        Err("FCM iOS implementation pending — see src-tauri/plugins/pallio-fcm/ios/TODO.md".into())
    }
    #[cfg(target_os = "android")]
    {
        // TODO: call into android/.../PalliFcmPlugin.kt
        Err("FCM Android implementation pending — see src-tauri/plugins/pallio-fcm/android/TODO.md".into())
    }
    #[cfg(not(any(target_os = "ios", target_os = "android")))]
    {
        Err("Push notifications are mobile-only.".into())
    }
}

#[tauri::command]
async fn unregister<R: Runtime>(_app: tauri::AppHandle<R>) -> Result<(), String> {
    // TODO: tear down the FCM token on the corresponding platform.
    Ok(())
}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
    Builder::new("pallio-fcm")
        .invoke_handler(tauri::generate_handler![register_for_push, unregister])
        .setup(|_app, _api| {
            // Plugin-level setup runs once per app launch. The native
            // Swift / Kotlin side will emit "push-message" events as
            // they arrive; the JS side subscribes via @tauri-apps/api
            // listen().
            Ok(())
        })
        .build()
}
