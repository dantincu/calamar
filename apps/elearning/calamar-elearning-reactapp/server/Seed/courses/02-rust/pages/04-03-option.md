Rust has **no null**. A value that might be absent is expressed with the standard enum `Option`:

```rust
enum Option<T> {
    Some(T),
    None,
}
```

Because `Option<i32>` and `i32` are different types, you can't accidentally use a missing value as if it were there — the compiler makes you handle `None`.

```rust
fn find_user(id: u32) -> Option<String> {
    if id == 1 { Some("Ada".to_string()) } else { None }
}

match find_user(7) {
    Some(name) => println!("found {name}"),
    None => println!("no such user"),
}
```

## `if let` and `let … else`

When you only care about one pattern, `if let` is shorter than `match`:

```rust
if let Some(name) = find_user(1) {
    println!("hello {name}");
}
```

`let … else` binds the value or leaves the function early:

```rust
fn greet(id: u32) {
    let Some(name) = find_user(id) else {
        println!("unknown user");
        return;
    };
    println!("hello {name}"); // name is available here
}
```

## Handy methods

```rust
let port: Option<u16> = config.get("port");

port.unwrap_or(8080)                    // a default
port.map(|p| p + 1)                     // transform the inner value
port.is_some()                          // test
port.ok_or("missing port")?             // turn into a Result (next chapter)
names.first().cloned().unwrap_or_default()
```

`unwrap()` and `expect("…")` extract the value but **panic** on `None`. Use them in quick experiments and tests, or when `None` would truly be a bug — not for input that might legitimately be missing.

## Exercise

Write `fn last_char(s: &str) -> Option<char>` and print the result for `"rust"` and `""` using `match`, then again using `if let`.
