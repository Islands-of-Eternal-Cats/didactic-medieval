use std::process::Command;

fn main() {
    let version = git_build_version(".").unwrap_or_else(|| "unknown".to_string());
    println!("cargo:rustc-env=CORE_BUILD_VERSION={version}");
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
