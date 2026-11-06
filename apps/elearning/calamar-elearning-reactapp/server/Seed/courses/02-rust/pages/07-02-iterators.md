## Closures

A **closure** is an anonymous function that can capture variables from its surroundings:

```rust
let threshold = 10;
let is_big = |x: i32| x > threshold;   // captures threshold by reference
println!("{}", is_big(12));
```

Types are usually inferred. `move` makes the closure take ownership of what it captures — required when the closure outlives the current scope, for example in a thread:

```rust
let name = String::from("worker");
let greet = move || println!("hello from {name}");
```

## Iterators

An iterator produces a sequence of values, one at a time, lazily. Collections give you three kinds:

| Method | Yields | Collection afterwards |
|---|---|---|
| `iter()` | `&T` | still usable |
| `iter_mut()` | `&mut T` | still usable, modified |
| `into_iter()` | `T` | consumed |

**Adapters** transform an iterator into another one; **consumers** run it:

```rust
let orders = vec![120.0, 15.5, 300.0, 42.0, 8.0];

let total_big: f64 = orders
    .iter()
    .filter(|&&amount| amount > 20.0)  // adapter
    .map(|amount| amount * 1.19)       // adapter: add VAT
    .sum();                            // consumer
```

Nothing happens until a consumer — `sum`, `count`, `collect`, `for`, `find`, `any`, `fold`… — pulls the values.

## `collect`

`collect` builds a collection from an iterator; tell it which with a type annotation:

```rust
let names: Vec<String> = users.iter().map(|u| u.name.clone()).collect();
let by_id: HashMap<u32, &User> = users.iter().map(|u| (u.id, u)).collect();
let parsed: Result<Vec<i32>, _> = ["1", "2", "x"].iter().map(|s| s.parse::<i32>()).collect(); // Err at "x"
```

## Useful adapters

`enumerate`, `zip`, `chain`, `take`, `skip`, `rev`, `step_by`, `flat_map`, `filter_map`, `take_while`, `windows` / `chunks` (on slices), `peekable`.

Iterator chains compile down to the same machine code as hand-written loops — another zero-cost abstraction. See the attached `iterators.rs`.
