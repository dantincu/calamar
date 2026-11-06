use std::sync::mpsc;
use std::thread;
use std::time::{Duration, Instant};

/// A deliberately slow "job": is n prime?
fn is_prime(n: u64) -> bool {
    if n < 2 {
        return false;
    }
    (2..).take_while(|d| d * d <= n).all(|d| n % d != 0)
}

fn main() {
    let start = Instant::now();
    let numbers: Vec<u64> = (1_000_000..1_000_200).collect();
    let workers = 4;

    let (tx, rx) = mpsc::channel::<(usize, u64, bool)>();

    // Split the work into chunks; each worker owns its chunk (moved in).
    let chunk_size = numbers.len().div_ceil(workers);
    for (id, chunk) in numbers.chunks(chunk_size).map(|c| c.to_vec()).enumerate() {
        let tx = tx.clone();
        thread::spawn(move || {
            for n in chunk {
                tx.send((id, n, is_prime(n))).expect("the receiver hung up");
            }
            thread::sleep(Duration::from_millis(5 * id as u64));
        });
    }
    drop(tx); // otherwise `for … in rx` would wait forever

    let mut primes = Vec::new();
    let mut per_worker = vec![0; workers];
    for (worker, n, prime) in rx {
        per_worker[worker] += 1;
        if prime {
            primes.push(n);
        }
    }
    primes.sort();

    println!("checked by each worker: {per_worker:?}");
    println!("{} primes found: {:?}", primes.len(), primes);

    // Scoped threads may borrow local data.
    let words = vec!["alpha", "beta", "gamma", "delta"];
    let total_len = thread::scope(|s| {
        let left = s.spawn(|| words[..2].iter().map(|w| w.len()).sum::<usize>());
        let right = s.spawn(|| words[2..].iter().map(|w| w.len()).sum::<usize>());
        left.join().unwrap() + right.join().unwrap()
    });
    println!("total length of {words:?} = {total_len}");
    println!("done in {:?}", start.elapsed());
}
