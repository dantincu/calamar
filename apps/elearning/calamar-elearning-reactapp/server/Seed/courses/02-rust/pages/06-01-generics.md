## Generic functions

Instead of writing `largest_i32`, `largest_f64` and `largest_char`, write one function with a **type parameter** `T`:

```rust
fn largest<T: PartialOrd>(items: &[T]) -> &T {
    let mut largest = &items[0];
    for item in items {
        if item > largest {
            largest = item;
        }
    }
    largest
}

largest(&[3, 7, 2]);          // T = i32
largest(&['x', 'b', 'q']);    // T = char
```

`T: PartialOrd` is a **trait bound**: "any type, as long as its values can be compared". Without it, `item > largest` wouldn't compile — the compiler only lets you do what the bounds promise.

## Generic structs and enums

```rust
struct Point<T> {
    x: T,
    y: T,
}

impl<T: std::ops::Add<Output = T> + Copy> Point<T> {
    fn sum(&self) -> T { self.x + self.y }
}

// methods only for one concrete type
impl Point<f64> {
    fn distance_from_origin(&self) -> f64 { (self.x.powi(2) + self.y.powi(2)).sqrt() }
}
```

You have used generic enums already: `Option<T>` and `Result<T, E>`. And `Vec<T>`, `HashMap<K, V>`…

## `where` clauses

Many bounds read better in a `where` clause:

```rust
fn summarize<T, U>(a: &T, b: &U) -> String
where
    T: std::fmt::Display + Clone,
    U: std::fmt::Debug,
{
    format!("{a} / {b:?}")
}
```

## Zero cost

Rust compiles generic code by **monomorphization**: it generates a specialized copy for each concrete type used. Generic code is exactly as fast as hand-written specific code.
