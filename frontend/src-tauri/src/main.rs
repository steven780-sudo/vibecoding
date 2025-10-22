// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::process::{Child, Command};
use std::sync::Mutex;
use tauri::Manager;

struct BackendProcess(Mutex<Option<Child>>);

fn main() {
    println!("=== Chronos 启动 ===");
    println!("初始化 Tauri 插件...");
    
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            println!("✅ Shell 插件已加载");
            println!("✅ Dialog 插件已加载");
            
            // Start the Python backend as a sidecar
            let backend_process = start_backend_server(app);
            app.manage(BackendProcess(Mutex::new(backend_process)));
            
            println!("=== Chronos 启动完成 ===");
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
    
    println!("=== 启动后端服务器 ===");
    
    #[cfg(target_os = "macos")]
    let backend_name = "backend";

    #[cfg(target_os = "windows")]
    let backend_name = "backend.exe";

    #[cfg(target_os = "linux")]
    let backend_name = "backend";

    println!("后端二进制文件名: {}", backend_name);

    // 尝试多种路径解析方式
    let backend_path = match app
        .path()
        .resolve(format!("binaries/{}", backend_name), BaseDirectory::Resource)
    {
        Ok(path) => {
            println!("✅ 解析Resource路径成功: {:?}", path);
            path
        }
        Err(e) => {
            eprintln!("❌ 解析Resource路径失败: {}", e);
            // 尝试使用AppData路径
            match app
                .path()
                .resolve(format!("binaries/{}", backend_name), BaseDirectory::AppData)
            {
                Ok(path) => {
                    println!("✅ 解析AppData路径成功: {:?}", path);
                    path
                }
                Err(e2) => {
                    eprintln!("❌ 解析AppData路径也失败: {}", e2);
                    return None;
                }
            }
        }
    };

    println!("准备启动后端: {:?}", backend_path);
    
    // 检查文件是否存在
    if !backend_path.exists() {
        eprintln!("❌ 后端二进制文件不存在: {:?}", backend_path);
        return None;
    }
    
    println!("✅ 后端二进制文件存在");

    // Start the backend process
    match Command::new(&backend_path).spawn() {
        Ok(child) => {
            println!("✅ 后端服务器启动成功，PID: {}", child.id());
            Some(child)
        }
        Err(e) => {
            eprintln!("❌ 启动后端服务器失败: {}", e);
            None
        }
    }
}
