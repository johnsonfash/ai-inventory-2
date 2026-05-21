// Prevents a console window from popping up alongside the GUI on
// Windows release builds. The cfg target attribute is `not(debug)`
// so dev builds still show the console for logs.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

fn main() {
    pallio_lib::run()
}
