## Defining and creating

```rust
struct User {
    name: String,
    email: String,
    active: bool,
    logins: u64,
}

let mut user = User {
    name: String::from("Ada"),
    email: String::from("ada@example.com"),
    active: true,
    logins: 1,
};
user.logins += 1;
```

Field init shorthand and struct update syntax:

```rust
fn new_user(name: String, email: String) -> User {
    User { name, email, active: true, logins: 0 }
}

let other = User { email: String::from("grace@example.com"), ..user };
```

**Tuple structs** and **unit structs**:

```rust
struct Meters(f64);   // a distinct type wrapping a number
struct Marker;        // no data
```

## Methods with `impl`

```rust
#[derive(Debug, Clone, PartialEq)]
struct Rectangle { width: f64, height: f64 }

impl Rectangle {
    // associated function (no self): a constructor, called Rectangle::square(3.0)
    fn square(size: f64) -> Self {
        Self { width: size, height: size }
    }

    fn area(&self) -> f64 { self.width * self.height }          // borrows immutably
    fn scale(&mut self, k: f64) { self.width *= k; self.height *= k; } // borrows mutably
    fn into_tuple(self) -> (f64, f64) { (self.width, self.height) }   // takes ownership
}
```

The receiver — `&self`, `&mut self` or `self` — applies the ownership rules to methods.

## Derived traits

`#[derive(...)]` generates common behaviour: `Debug` (print with `{:?}`), `Clone`, `PartialEq` (`==`), `Default`, `Hash`…

See the attached `rectangle.rs`.
