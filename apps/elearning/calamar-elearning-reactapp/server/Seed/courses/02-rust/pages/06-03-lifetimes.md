Every reference has a **lifetime**: the part of the program during which it is valid. Most of the time the compiler infers lifetimes on its own. You annotate them only when it can't tell how the references in a signature relate.

## The classic example

```rust
fn longest(a: &str, b: &str) -> &str {   // ❌ missing lifetime specifier
    if a.len() > b.len() { a } else { b }
}
```

The returned reference comes from either `a` or `b` — the compiler doesn't know which, so it can't check how long the result may be used. We tell it:

```rust
fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() > b.len() { a } else { b }
}
```

Read it as: "for some lifetime `'a`, both inputs live at least as long as `'a`, and so does the result". In practice the result is valid as long as **both** inputs are.

```rust
let outer = String::from("a long string");
let result;
{
    let inner = String::from("short");
    result = longest(&outer, &inner);
    println!("{result}"); // ✅ inner is still alive
}
// println!("{result}"); // ❌ inner was dropped; result might point into it
```

Annotations don't change how long anything lives — they only describe relationships so the compiler can verify them.

## Lifetime elision

You rarely write them because of three elision rules. For example, a method taking `&self` returns references tied to `self` by default:

```rust
impl Parser {
    fn current_token(&self) -> &str { … } // no annotations needed
}
```

## Structs holding references

A struct that stores a reference needs a lifetime parameter, guaranteeing it can't outlive the data:

```rust
struct Excerpt<'a> {
    part: &'a str,
}
```

## `'static`

`'static` means "valid for the whole program" — string literals have it: `let s: &'static str = "hi";`. When the compiler suggests adding `'static` to fix an error, it's usually better to own the data (`String`) instead.

See the attached `longest.rs`.
