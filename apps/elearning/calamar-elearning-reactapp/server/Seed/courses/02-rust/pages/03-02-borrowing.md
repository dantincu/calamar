A **reference** lets you use a value without taking ownership of it. Creating a reference is called **borrowing**.

```rust
fn length(s: &String) -> usize {
    s.len()
} // s goes out of scope, but it doesn't own the string: nothing is dropped

let text = String::from("hello");
let n = length(&text);
println!("{text} has {n} bytes"); // ✅ text is still ours
```

## Mutable references

```rust
fn shout(s: &mut String) {
    s.push_str("!!!");
}

let mut text = String::from("hello");
shout(&mut text);
```

## The borrowing rules

At any given time you can have **either**:

- **any number of shared references** `&T`, **or**
- **exactly one mutable reference** `&mut T`,

and references must always be **valid** (never outlive what they point to).

```rust
let mut v = vec![1, 2, 3];
let first = &v[0];   // shared borrow
v.push(4);           // ❌ mutable borrow while `first` is still used
println!("{first}");
```

This looks strict, but it prevents a real bug: `push` may reallocate the vector, leaving `first` pointing at freed memory. The same rule prevents **data races** between threads at compile time.

## Borrows end at last use

The compiler is smart about *where* a borrow is last used (non-lexical lifetimes):

```rust
let mut s = String::from("x");
let r1 = &s;
let r2 = &s;
println!("{r1} {r2}");  // last use of r1 and r2
let r3 = &mut s;        // ✅ fine now
r3.push('y');
```

## No dangling references

```rust
fn dangle() -> &String {      // ❌ missing lifetime: what would this point to?
    let s = String::from("hi");
    &s
} // s is dropped here
```

Return the owned `String` instead.

See the attached `borrowing.rs`.
