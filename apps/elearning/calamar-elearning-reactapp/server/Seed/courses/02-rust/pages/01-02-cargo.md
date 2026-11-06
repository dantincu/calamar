Cargo creates projects, builds them, runs tests and downloads dependencies (called **crates**) from [crates.io](https://crates.io).

## A new project

```bash
cargo new hello
cd hello
cargo run
```

```
hello/
  Cargo.toml      <- the manifest: name, version, dependencies
  src/
    main.rs       <- the program's entry point
```

`src/main.rs` contains:

```rust
fn main() {
    println!("Hello, world!");
}
```

`println!` ends with `!` because it is a **macro**, not a function — macros can take a variable number of arguments and check the format string at compile time.

## Everyday commands

| Command | Does |
|---|---|
| `cargo run` | build and run |
| `cargo build` | build a debug binary in `target/debug/` |
| `cargo build --release` | an optimized binary in `target/release/` |
| `cargo check` | type-check quickly without producing a binary |
| `cargo test` | run the tests |
| `cargo add rand` | add a dependency to `Cargo.toml` |

## Using a crate

```bash
cargo add rand
```

```rust
use rand::Rng;

fn main() {
    let n = rand::rng().random_range(1..=100);
    println!("Your lucky number is {n}");
}
```

The attached `Cargo.toml` and `main.rs` are a small guessing game that reads from standard input.
