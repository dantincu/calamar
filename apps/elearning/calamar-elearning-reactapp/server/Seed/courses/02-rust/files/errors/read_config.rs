use std::collections::HashMap;
use std::fs;
use std::io::ErrorKind;

/// Reads "key = value" lines. A missing file means "no settings";
/// any other I/O error is returned to the caller.
fn read_config(path: &str) -> Result<HashMap<String, String>, std::io::Error> {
    let text = match fs::read_to_string(path) {
        Ok(t) => t,
        Err(e) if e.kind() == ErrorKind::NotFound => return Ok(HashMap::new()),
        Err(e) => return Err(e),
    };

    let mut settings = HashMap::new();
    for line in text.lines() {
        let line = line.trim();
        if line.is_empty() || line.starts_with('#') {
            continue;
        }
        if let Some((key, value)) = line.split_once('=') {
            settings.insert(key.trim().to_string(), value.trim().to_string());
        }
    }
    Ok(settings)
}

fn main() {
    // Write a sample file so the example runs anywhere.
    fs::write("app.conf", "# sample\nport = 8080\nname = demo\ndebug = yes\n").expect("could not write app.conf");

    match read_config("app.conf") {
        Ok(settings) => {
            // parse() returns a Result too; unwrap_or supplies a default.
            let port: u16 = settings.get("port").and_then(|p| p.parse().ok()).unwrap_or(3000);
            let workers: u32 = settings.get("workers").and_then(|w| w.parse().ok()).unwrap_or(4);
            println!("port = {port}, workers = {workers}, all = {settings:?}");
        }
        Err(e) => eprintln!("could not read the configuration: {e}"),
    }

    match read_config("does-not-exist.conf") {
        Ok(s) if s.is_empty() => println!("no configuration file: using defaults"),
        Ok(s) => println!("{s:?}"),
        Err(e) => eprintln!("error: {e}"),
    }

    let _ = fs::remove_file("app.conf");
}
