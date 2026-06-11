use tauri::Manager;

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn close_app(app: tauri::AppHandle) {
    app.exit(0);
}

pub fn run() {
    std::env::set_var("WEBKIT_DISABLE_COMPOSITING_MODE", "1");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_single_instance::init(|app, _, _| {
            app.webview_windows()
                .values()
                .next()
                .expect("no window found")
                .set_focus()
                .expect("failed to set focus");
        }))
        .invoke_handler(tauri::generate_handler![greet, close_app])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
