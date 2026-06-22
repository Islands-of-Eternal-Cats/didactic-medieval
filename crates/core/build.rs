use std::path::PathBuf;
use std::process::Command;

fn main() {
    register_git_rerun_if_changed();

    let version = git_build_version(".").unwrap_or_else(|| "unknown".to_string());
    println!("cargo:rustc-env=CORE_BUILD_VERSION={version}");
}

fn register_git_rerun_if_changed() {
    let manifest_dir = match std::env::var("CARGO_MANIFEST_DIR") {
        Ok(dir) => PathBuf::from(dir),
        Err(_) => return,
    };
    let git_dir = manifest_dir.join("../../.git");
    let head = git_dir.join("HEAD");
    if head.is_file() {
        println!("cargo:rerun-if-changed={}", head.display());
    }
    let refs_heads = git_dir.join("refs/heads");
    if refs_heads.is_dir() {
        println!("cargo:rerun-if-changed={}", refs_heads.display());
    }
}

fn git_build_version(path: &str) -> Option<String> {
    let output = Command::new("git")
        .env("TZ", "UTC")
        .args([
            "log",
            "-1",
            "--format=%cd",
            "--date=format:%Y%m%d.%H%M%S",
            "--",
            path,
        ])
        .output()
        .ok()?;

    if !output.status.success() {
        return None;
    }

    let version = String::from_utf8(output.stdout).ok()?.trim().to_string();
    if version.is_empty() {
        None
    } else {
        Some(version)
    }
}
