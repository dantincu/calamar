const SECONDS_PER_HOUR: u32 = 60 * 60;

fn main() {
    // Immutable binding.
    let hours = 3;
    println!("{hours} hours = {} seconds", hours * SECONDS_PER_HOUR);

    // Mutable binding.
    let mut total = 0;
    for n in 1..=10 {
        total += n;
    }
    println!("1 + 2 + ... + 10 = {total}");

    // Shadowing: same name, new variable, even a new type.
    let spaces = "    ";
    let spaces = spaces.len();
    println!("there were {spaces} spaces");

    // Shadowing inside a block ends with the block.
    let x = 5;
    {
        let x = x * 2;
        println!("inner x = {x}"); // 10
    }
    println!("outer x = {x}"); // 5
}
