A **slice** is a reference to a contiguous part of a collection. It doesn't own anything; it borrows.

## String slices

```rust
let s = String::from("hello world");
let hello: &str = &s[0..5];
let world: &str = &s[6..];
let all: &str = &s[..];
```

Ranges are **byte** offsets, and must fall on character boundaries — slicing in the middle of a multi-byte character panics. For text processing prefer methods like `split_whitespace`, `find` or `char_indices`.

## Why slices matter

Consider a function returning the first word. Returning an index would be fragile: if the string changes, the index silently becomes meaningless. Returning a slice ties the result to the string:

```rust
fn first_word(s: &str) -> &str {
    s.split(' ').next().unwrap_or("")
}

let mut text = String::from("hello world");
let word = first_word(&text);
text.clear();        // ❌ can't mutate while `word` borrows it
println!("{word}");
```

The borrow checker catches the bug at compile time.

## Take `&str`, not `&String`

`&String` automatically converts to `&str` (deref coercion), so a function taking `&str` accepts both string literals and `String`s:

```rust
first_word("literal");
first_word(&owned_string);
```

## Other slices

The same idea works for arrays and vectors:

```rust
let numbers = [1, 2, 3, 4, 5];
let middle: &[i32] = &numbers[1..4]; // [2, 3, 4]

fn sum(values: &[i32]) -> i32 { values.iter().sum() }
sum(&numbers);
sum(&vec![10, 20]);
```

See the attached `first_word.rs`.
