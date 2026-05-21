// Cargo build script. Tauri reads tauri.conf.json + the capability
// files here, generates the schema for capabilities, and emits
// permissions metadata.
fn main() {
    tauri_build::build()
}
