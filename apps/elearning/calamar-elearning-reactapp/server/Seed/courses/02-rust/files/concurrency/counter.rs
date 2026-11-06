use std::collections::HashMap;
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::{Arc, Mutex, RwLock};
use std::thread;

fn main() {
    // 1. Arc<Mutex<T>>: a shared counter.
    let counter = Arc::new(Mutex::new(0u64));
    let handles: Vec<_> = (0..8)
        .map(|_| {
            let counter = Arc::clone(&counter);
            thread::spawn(move || {
                for _ in 0..1_000 {
                    *counter.lock().unwrap() += 1;
                }
            })
        })
        .collect();
    for h in handles {
        h.join().unwrap();
    }
    println!("mutex counter: {}", *counter.lock().unwrap()); // always 8000

    // 2. An atomic: the same, without a lock.
    let hits = Arc::new(AtomicUsize::new(0));
    thread::scope(|s| {
        for _ in 0..8 {
            let hits = &hits;
            s.spawn(move || {
                for _ in 0..1_000 {
                    hits.fetch_add(1, Ordering::Relaxed);
                }
            });
        }
    });
    println!("atomic counter: {}", hits.load(Ordering::Relaxed));

    // 3. Arc<Mutex<HashMap>>: workers recording results in a shared map.
    let results: Arc<Mutex<HashMap<u32, u64>>> = Arc::new(Mutex::new(HashMap::new()));
    let handles: Vec<_> = (1..=5u32)
        .map(|n| {
            let results = Arc::clone(&results);
            thread::spawn(move || {
                let factorial: u64 = (1..=n as u64 * 3).product();
                results.lock().unwrap().insert(n * 3, factorial);
            })
        })
        .collect();
    handles.into_iter().for_each(|h| h.join().unwrap());
    let mut sorted: Vec<_> = results.lock().unwrap().clone().into_iter().collect();
    sorted.sort();
    for (n, f) in sorted {
        println!("{n:>2}! = {f}");
    }

    // 4. RwLock: many readers at once.
    let config = Arc::new(RwLock::new(String::from("v1")));
    thread::scope(|s| {
        for i in 0..3 {
            let config = &config;
            s.spawn(move || println!("reader {i} sees {}", config.read().unwrap()));
        }
    });
    *config.write().unwrap() = "v2".into();
    println!("after the write: {}", config.read().unwrap());

    // Uncomment: Rc is not Send, so this doesn't compile.
    // let rc = std::rc::Rc::new(5);
    // thread::spawn(move || println!("{rc}"));
}
