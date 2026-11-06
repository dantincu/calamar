## The `?` operator

Writing a `match` for every fallible call quickly gets noisy. `?` does it for you: on `Ok(v)` it gives `v`, on `Err(e)` it **returns the error** from the current function.

```rust
fn read_number(path: &str) -> Result<i64, Box<dyn std::error::Error>> {
    let text = std::fs::read_to_string(path)?;  // io::Error
    let n = text.trim().parse::<i64>()?;        // ParseIntError
    Ok(n * 2)
}
```

`?` also *converts* the error with `From`, which is why both an `io::Error` and a `ParseIntError` fit into `Box<dyn Error>`. It works on `Option` too, returning `None` early.

`main` can return a `Result`, so `?` works there as well:

```rust
fn main() -> Result<(), Box<dyn std::error::Error>> {
    let n = read_number("n.txt")?;
    println!("{n}");
    Ok(())
}
```

## A custom error type

For libraries and larger programs, define an enum describing everything that can go wrong:

```rust
#[derive(Debug)]
enum AppError {
    Io(std::io::Error),
    Parse { line: usize, message: String },
    Empty,
}

impl std::fmt::Display for AppError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            AppError::Io(e) => write!(f, "I/O error: {e}"),
            AppError::Parse { line, message } => write!(f, "line {line}: {message}"),
            AppError::Empty => write!(f, "the file is empty"),
        }
    }
}

impl std::error::Error for AppError {}

// lets `?` turn io::Error into AppError automatically
impl From<std::io::Error> for AppError {
    fn from(e: std::io::Error) -> Self { AppError::Io(e) }
}
```

Callers can now `match` on precisely what went wrong.

## Crates that help

- **`thiserror`** derives `Display`, `Error` and `From` for your error enums — ideal for libraries.
- **`anyhow`** gives a convenient catch-all `anyhow::Result<T>` with context messages — ideal for applications.

See the attached `errors.rs`, which uses only the standard library.
