## `Vec<T>`: a growable array

```rust
let mut v: Vec<i32> = Vec::new();
v.push(1);
let mut w = vec![3, 1, 2];
w.sort();

let third: &i32 = &w[2];          // panics if out of range
let maybe: Option<&i32> = w.get(10); // None if out of range

for x in &mut w { *x *= 10; }     // modify in place
```

## `String`: owned UTF-8 text

```rust
let mut s = String::from("foo");
s.push_str("bar");
s.push('!');
let joined = format!("{s}-{}", 42);   // doesn't take ownership of anything

for c in "héllo".chars() { }           // Unicode characters
"héllo".len();                         // 6 bytes, not 5 characters!
```

You can't index a `String` with `s[0]`: a byte index doesn't necessarily correspond to a character. Iterate with `chars()` or slice on known boundaries.

## `HashMap<K, V>`

```rust
use std::collections::HashMap;

let mut scores: HashMap<String, u32> = HashMap::new();
scores.insert("blue".to_string(), 10);

if let Some(s) = scores.get("blue") { println!("{s}"); }

// the entry API: insert if missing, then update
*scores.entry("red".to_string()).or_insert(0) += 5;
```

`HashMap` iteration order is unspecified. Use `BTreeMap` when you want keys sorted.

## Others

`VecDeque` (a double-ended queue), `HashSet` / `BTreeSet` (unique values), `BinaryHeap` (a priority queue).

The attached `word_count.rs` counts word frequencies with a `HashMap` and the entry API, then sorts them with a `Vec`.
