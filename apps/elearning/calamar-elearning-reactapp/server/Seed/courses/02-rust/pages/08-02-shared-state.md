Sometimes threads really do need to share the same data. Rust provides the building blocks, and the type system makes sure you use them.

## `Mutex<T>`: one at a time

A mutex wraps the data it protects. The only way to reach the data is to `lock()` it, which returns a guard; the lock is released automatically when the guard is dropped.

```rust
use std::sync::Mutex;

let m = Mutex::new(0);
{
    let mut n = m.lock().unwrap();
    *n += 1;
} // unlocked here
```

You can't forget to lock — the data is simply inaccessible otherwise.

## `Arc<T>`: shared ownership across threads

To give several threads ownership of the same mutex, wrap it in an **atomically reference-counted** pointer:

```rust
use std::sync::{Arc, Mutex};
use std::thread;

let counter = Arc::new(Mutex::new(0));
let mut handles = vec![];

for _ in 0..10 {
    let counter = Arc::clone(&counter);
    handles.push(thread::spawn(move || {
        *counter.lock().unwrap() += 1;
    }));
}
for h in handles { h.join().unwrap(); }

println!("{}", *counter.lock().unwrap()); // 10
```

`Rc<T>`, the single-threaded version, is *not* thread-safe — and the compiler refuses to send it to another thread.

## `Send` and `Sync`

Two marker traits make this work:

- **`Send`**: a value of this type may be moved to another thread.
- **`Sync`**: a reference `&T` may be shared between threads.

The compiler implements them automatically for types made of `Send`/`Sync` parts. `Rc` and `RefCell` aren't, so mistakes become compile errors rather than heisenbugs.

## Other tools

- `RwLock<T>` — many readers *or* one writer.
- Atomics (`AtomicUsize`, `AtomicBool`) — lock-free counters and flags.
- The **rayon** crate — turns `iter()` into `par_iter()` for data parallelism.
- **tokio** — an async runtime for I/O-heavy programs such as servers.

> Beware of deadlocks: Rust prevents data races, not logic errors. Always acquire multiple locks in the same order.

See the attached `counter.rs`.
