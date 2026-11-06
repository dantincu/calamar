## `panic!`

```rust
panic!("the configuration is corrupt");
let v = vec![1, 2, 3];
v[99]; // panics: index out of bounds
```

A panic unwinds the stack of the current thread, printing a message. Set `RUST_BACKTRACE=1` to see where it came from. Use panics for situations that indicate a **bug**, not for expected failures.

## `Result`

```rust
enum Result<T, E> {
    Ok(T),
    Err(E),
}
```

Functions that can fail return a `Result`:

```rust
use std::fs;

match fs::read_to_string("config.toml") {
    Ok(text) => println!("{} bytes", text.len()),
    Err(e) => eprintln!("could not read the configuration: {e}"),
}
```

## Matching on the kind of error

```rust
use std::io::ErrorKind;

let text = match fs::read_to_string(path) {
    Ok(t) => t,
    Err(e) if e.kind() == ErrorKind::NotFound => String::new(), // missing: use defaults
    Err(e) => return Err(e),                                     // anything else: give up
};
```

## Shortcuts

```rust
let n: i32 = "42".parse().unwrap();                  // panics on error
let n: i32 = "42".parse().expect("not a number");   // panics with a message
let n: i32 = input.parse().unwrap_or(0);              // a default
let n = input.parse::<i32>().map(|x| x * 2);         // transform the Ok value
let ok: bool = result.is_ok();
let maybe: Option<i32> = result.ok();                // drop the error
```

## Choosing

| Situation | Use |
|---|---|
| The caller can reasonably react | return `Result` |
| A value may be absent, no error detail needed | return `Option` |
| A broken invariant, a bug | `panic!` / `unwrap` / `expect` |
| Examples, prototypes, tests | `unwrap` is fine |

See the attached `read_config.rs`.
