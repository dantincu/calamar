## Spawning threads

```rust
use std::thread;
use std::time::Duration;

let handle = thread::spawn(|| {
    for i in 1..=3 {
        println!("worker: {i}");
        thread::sleep(Duration::from_millis(10));
    }
});

println!("main keeps going");
handle.join().unwrap(); // wait for the worker to finish
```

## `move` closures

A thread may outlive the function that started it, so it can't borrow local variables. Move them in:

```rust
let data = vec![1, 2, 3];
let handle = thread::spawn(move || {
    println!("sum = {}", data.iter().sum::<i32>());
});
// data now belongs to the thread
```

## Scoped threads

When threads are guaranteed to end before the function returns, `thread::scope` lets them **borrow**:

```rust
let mut numbers = vec![1, 2, 3, 4];
thread::scope(|s| {
    s.spawn(|| println!("len = {}", numbers.len()));
    s.spawn(|| println!("first = {}", numbers[0]));
}); // all scoped threads are joined here
numbers.push(5);
```

## Message passing with channels

"Do not communicate by sharing memory; share memory by communicating." A channel has a **sender** and a **receiver**; sending a value transfers its ownership:

```rust
use std::sync::mpsc;

let (tx, rx) = mpsc::channel();

for id in 0..3 {
    let tx = tx.clone();                 // multiple producers
    thread::spawn(move || {
        tx.send(format!("hello from {id}")).unwrap();
    });
}
drop(tx); // close the original sender so the loop below can end

for message in rx {                      // single consumer
    println!("{message}");
}
```

Once a value has been sent, the sending thread can't use it any more — the compiler enforces it, so the two threads can never touch the same data at the same time.

See the attached `channels.rs`: a small pipeline of worker threads.
