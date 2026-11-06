use rand::Rng;
use std::cmp::Ordering;
use std::io::{self, Write};

fn main() {
    println!("Guess the number between 1 and 100!");
    let secret = rand::rng().random_range(1..=100);
    let mut tries = 0;

    loop {
        print!("Your guess: ");
        io::stdout().flush().unwrap();

        let mut line = String::new();
        io::stdin().read_line(&mut line).expect("failed to read a line");

        // Shadowing: `guess` becomes a number. Bad input just asks again.
        let guess: u32 = match line.trim().parse() {
            Ok(n) => n,
            Err(_) => {
                println!("Please type a number.");
                continue;
            }
        };
        tries += 1;

        match guess.cmp(&secret) {
            Ordering::Less => println!("Too small."),
            Ordering::Greater => println!("Too big."),
            Ordering::Equal => {
                println!("You got it in {tries} tries!");
                break;
            }
        }
    }
}
