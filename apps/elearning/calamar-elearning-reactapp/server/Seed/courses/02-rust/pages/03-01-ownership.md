## The three rules

1. Each value has a single **owner** (a variable).
2. There can only be one owner at a time.
3. When the owner goes out of scope, the value is **dropped** (its memory freed).

```rust
{
    let s = String::from("hello"); // s owns the string's heap memory
    // use s
} // s goes out of scope: the memory is freed, automatically and deterministically
```

## Moves

Assigning a heap-owning value to another variable **moves** it:

```rust
let a = String::from("hi");
let b = a;              // ownership moves to b
println!("{a}");        // ❌ error: borrow of moved value: `a`
```

Without this rule both `a` and `b` would free the same memory at the end of the scope — a *double free*. Rust makes it impossible at compile time.

Passing a value to a function moves it too:

```rust
fn consume(s: String) { /* s is dropped at the end */ }

let name = String::from("Ferris");
consume(name);
// name can't be used here any more
```

A function can give ownership back by returning the value.

## Copy types

Simple values stored entirely on the stack — integers, floats, `bool`, `char`, and tuples/arrays of them — implement `Copy`. Assigning them copies instead of moving:

```rust
let x = 5;
let y = x;
println!("{x} {y}"); // ✅ both valid
```

## Clone

When you really want a deep copy of heap data, ask for it explicitly:

```rust
let a = String::from("hi");
let b = a.clone();  // a new allocation
println!("{a} {b}");
```

`clone` being explicit makes expensive copies visible in the code.

Constantly moving values in and out of functions would be tedious — the next page shows **borrowing**, the solution. See the attached `ownership.rs`.
