An **enum** is a type whose value is exactly one of a set of **variants**. Unlike enums in many languages, each Rust variant can carry its own data.

```rust
enum Shape {
    Circle { radius: f64 },
    Rectangle { width: f64, height: f64 },
    Triangle(f64, f64, f64),
}
```

## `match`

`match` compares a value against patterns and runs the first arm that fits:

```rust
fn area(shape: &Shape) -> f64 {
    match shape {
        Shape::Circle { radius } => std::f64::consts::PI * radius * radius,
        Shape::Rectangle { width, height } => width * height,
        Shape::Triangle(a, b, c) => {
            let s = (a + b + c) / 2.0;
            (s * (s - a) * (s - b) * (s - c)).sqrt()
        }
    }
}
```

`match` is **exhaustive**: if you add a variant and forget to handle it somewhere, the program doesn't compile. This turns "forgot a case" bugs into compiler errors.

## Patterns

```rust
match n {
    0 => "zero",
    1 | 2 => "one or two",              // alternatives
    3..=9 => "a few",                   // ranges
    x if x % 2 == 0 => "big and even",  // guards
    _ => "something else",              // catch-all
}
```

Patterns also destructure tuples, structs and nested enums:

```rust
match (command, args.len()) {
    ("add", 1) => …,
    ("list", 0) => …,
    (other, _) => println!("unknown command {other}"),
}
```

## Methods on enums

Enums can have `impl` blocks just like structs — see the attached `shapes.rs`, which models a small drawing with an enum, `match` and methods.
