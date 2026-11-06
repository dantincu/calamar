## Functions

```rust
fn add(a: i32, b: i32) -> i32 {
    a + b // no semicolon: this expression is the return value
}
```

Parameter types are always required; the return type follows `->`. Use `return` for early exits.

## Statements and expressions

Almost everything in Rust is an **expression** that produces a value — including blocks and `if`:

```rust
let parity = if n % 2 == 0 { "even" } else { "odd" };

let y = {
    let x = 3;
    x * x  // the block's value
};
```

Adding a `;` turns an expression into a statement, which produces `()` ("unit", nothing).

## Conditions

```rust
if temperature > 30 {
    println!("hot");
} else if temperature < 10 {
    println!("cold");
} else {
    println!("nice");
}
```

The condition must be a `bool` — there are no "truthy" numbers.

## Loops

```rust
// loop: forever, until break. break can return a value.
let mut tries = 0;
let found = loop {
    tries += 1;
    if tries == 3 { break tries * 10; }
};

// while
while stack.len() > 0 { stack.pop(); }

// for over a range or a collection — the most common loop
for i in 0..5 { }          // 0, 1, 2, 3, 4
for i in (1..=3).rev() { } // 3, 2, 1
for name in &names { }
```

Loops can carry labels to break out of an outer loop: `'outer: for … { break 'outer; }`.

The attached `fizzbuzz.rs` is the classic exercise, written with expressions.
