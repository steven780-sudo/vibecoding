// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::Manager;

struct BackendProcess(Mutex<Option<Child>>);

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            // Start the Python backend as a sidecar
            let backend_process = start_backend_server(app);
            app.manage(BackendProcess(Mutex::new(backend_process)));
            Ok(())
        })
        .on_window_event(|_window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                // Clean up backend process when window closes
                let app_handle = _window.app_handle();
                if let Some(backend) = app_handle.try_state::<BackendProcess>() {
                    if let Ok(mut process) = backend.0.lock() {
                        if let Some(mut child) = process.take() {
                            let _ = child.kill();
                        }
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn start_backend_server(app: &tauri::App) -> Option<Child> {
    use tauri::path::BaseDirectory;
    
    #[cfg(target_os = "macos")]
    let backend_name = "backend";

    #[cfg(target_os = "windows")]
    let backend_name = "backend.exe";

    #[cfg(target_os = "linux")]
    let backend_name = "backend";

    let backend_path = app
        .path()
        .resolve(format!("binaries/{}", backend_name), BaseDirectory::Resource)
        .expect("failed to resolve backend binary");

    println!("Starting backend server from: {:?}", backend_path);

    // Start the backend process
    match Command::new(&backend_path).spawn() {
        Ok(child) => {
            println!("Backend server started with PID: {}", child.id());
            Some(child)
        }
        Err(e) => {
            eprintln!("Failed to start backend server: {}", e);
            None
        }
    }
}
