Rust is **statically typed**: every value's type is known at compile time.

## Scalar types

| Kind | Types | Notes |
|---|---|---|
| Signed integers | `i8` `i16` `i32` `i64` `i128` `isize` | `i32` is the default |
| Unsigned integers | `u8` `u16` `u32` `u64` `u128` `usize` | `usize` indexes collections |
| Floats | `f32` `f64` | `f64` is the default |
| Boolean | `bool` | `true` / `false` |
| Character | `char` | a Unicode scalar value, 4 bytes: `'a'`, `'ß'`, `'🦀'` |

Integer overflow panics in debug builds. When you want specific behaviour, say so: `wrapping_add`, `checked_add` (returns an `Option`), `saturating_add`.

## No implicit conversions

```rust
let a: i32 = 10;
let b: i64 = 20;
let c = a + b;            // ❌ mismatched types
let c = a as i64 + b;     // ✅ explicit cast
let d: i64 = a.into();    // ✅ lossless conversion
```

## Compound types

**Tuples** group values of different types:

```rust
let point: (i32, f64, char) = (1, 2.5, 'z');
let (x, y, z) = point;     // destructuring
println!("{}", point.0);   // access by position
```

**Arrays** have a fixed length known at compile time:

```rust
let days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
let zeros = [0u8; 16];     // 16 zeros
println!("{}", days[1]);   // indexes are checked: out of bounds panics, never reads garbage
```

For growable lists you'll use `Vec<T>` (chapter 7).

## Strings, briefly

`&str` is a borrowed view of text (string literals are `&'static str`); `String` is an owned, growable string. You'll understand the difference fully after the Ownership chapter.

See the attached `types.rs`.
