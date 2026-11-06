## Immutable by default

```rust
let x = 5;
x = 6; // ❌ error: cannot assign twice to immutable variable
```

Opt into mutation with `mut`:

```rust
let mut count = 0;
count += 1;
```

Immutability by default makes code easier to reason about: when you see `let`, you know the value won't change.

## Constants

```rust
const MAX_POINTS: u32 = 100_000;
```

Constants always need a type, are evaluated at compile time, and are written in `SCREAMING_SNAKE_CASE`.

## Shadowing

You can declare a new variable with the same name. The new one *shadows* the old:

```rust
let input = "42";
let input: i32 = input.parse().unwrap(); // a new variable, even of a new type
let input = input * 2;
```

Unlike `mut`, shadowing creates a fresh binding — useful for transforming a value step by step without inventing names like `input_str` and `input_num`.

## Type inference

Rust infers most types, but you can always annotate:

```rust
let a = 3;          // i32, the default integer
let b = 2.5;        // f64, the default float
let c: u8 = 255;
let name = "Ferris"; // &str
```

See the attached `variables.rs`.
