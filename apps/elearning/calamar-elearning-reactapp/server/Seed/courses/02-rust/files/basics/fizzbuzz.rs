/// `if` and `match` are expressions, so this function is a single expression.
fn fizzbuzz(n: u32) -> String {
    match (n % 3, n % 5) {
        (0, 0) => "FizzBuzz".to_string(),
        (0, _) => "Fizz".to_string(),
        (_, 0) => "Buzz".to_string(),
        _ => n.to_string(),
    }
}

fn is_prime(n: u32) -> bool {
    if n < 2 {
        return false; // early return
    }
    let mut d = 2;
    while d * d <= n {
        if n % d == 0 {
            return false;
        }
        d += 1;
    }
    true
}

fn main() {
    for n in 1..=20 {
        let marker = if is_prime(n) { " (prime)" } else { "" };
        println!("{:>2}: {}{marker}", n, fizzbuzz(n));
    }

    // A loop that returns a value with break.
    let mut n = 100;
    let first_prime_after_100 = loop {
        n += 1;
        if is_prime(n) {
            break n;
        }
    };
    println!("first prime after 100: {first_prime_after_100}");
}
