/// Accepts &str, so it works for literals and for &String alike.
fn first_word(s: &str) -> &str {
    let bytes = s.as_bytes();
    for (i, &b) in bytes.iter().enumerate() {
        if b == b' ' {
            return &s[..i];
        }
    }
    s
}

/// Slices of numbers work the same way.
fn average(values: &[f64]) -> Option<f64> {
    if values.is_empty() {
        None
    } else {
        Some(values.iter().sum::<f64>() / values.len() as f64)
    }
}

fn main() {
    let owned = String::from("borrowed slices everywhere");
    println!("first word of a String:  {}", first_word(&owned));
    println!("first word of a literal: {}", first_word("hello there"));

    let temps = [21.5, 23.0, 19.5, 24.0, 22.0];
    println!("average of all:      {:?}", average(&temps));
    println!("average of 2nd..4th: {:?}", average(&temps[1..4]));
    println!("average of nothing:  {:?}", average(&[]));

    // Uncomment to see the borrow checker protect the slice:
    // let mut text = String::from("hello world");
    // let word = first_word(&text);
    // text.clear();
    // println!("{word}");
}
