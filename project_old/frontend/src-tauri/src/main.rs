// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::Manager;
use tauri_plugin_shell::ShellExt;
use std::sync::Mutex;

// Store the backend process handle
struct BackendProcess(Mutex<Option<tauri_plugin_shell::process::CommandChild>>);

fn main() {
    println!("=== Chronos 启动 ===");
    
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            println!("✅ 插件已加载");
            
            // Start the Python backend using Tauri's sidecar
            let backend_process = start_backend_server(app);
            app.manage(BackendProcess(Mutex::new(backend_process)));
            
            println!("=== Chronos 启动完成 ===");
            Ok(())
        })
        .on_window_event(|window, event| {
            if let tauri::WindowEvent::CloseRequested { .. } = event {
                println!("=== 窗口关闭，清理后端进程 ===");
                // Clean up backend process when window closes
                let app_handle = window.app_handle();
                if let Some(backend) = app_handle.try_state::<BackendProcess>() {
                    if let Ok(mut process) = backend.0.lock() {
                        if let Some(child) = process.take() {
                            println!("🛑 终止后端进程");
                            let _ = child.kill();
                        }
                    }
                }
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

fn start_backend_server(app: &tauri::App) -> Option<tauri_plugin_shell::process::CommandChild> {
    println!("=== 启动后端服务器 ===");

    let shell = app.shell();

    // Try multiple possible names for the backend binary
    let backend_names = vec![
        "backend",                    // Generic name
        "backend-aarch64-apple-darwin", // Platform-specific name
        "binaries/backend",           // Full path from externalBin config
    ];

    for backend_name in backend_names {
        println!("🔍 尝试启动后端: {}", backend_name);

        match shell.sidecar(backend_name) {
            Ok(sidecar) => {
                println!("✅ 找到后端 sidecar: {}", backend_name);

                // Spawn the sidecar process
                match sidecar.spawn() {
                    Ok((_, child)) => {
                        println!("✅ 后端服务器启动成功，PID: {}, 名称: {}", child.pid(), backend_name);
                        return Some(child);
                    }
                    Err(e) => {
                        println!("❌ 使用 '{}' 启动失败: {}", backend_name, e);
                        continue;
                    }
                }
            }
            Err(e) => {
                println!("❌ 无法找到后端 sidecar '{}': {}", backend_name, e);
                continue;
            }
        }
    }

    eprintln!("❌ 所有后端启动尝试都失败了");
    None
}


