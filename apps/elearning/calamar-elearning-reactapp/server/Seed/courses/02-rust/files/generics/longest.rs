/// The result lives as long as the shorter-lived of the two inputs.
fn longest<'a>(a: &'a str, b: &'a str) -> &'a str {
    if a.len() >= b.len() { a } else { b }
}

/// A struct borrowing part of a text: it can't outlive the text.
#[derive(Debug)]
struct Excerpt<'a> {
    sentence: &'a str,
}

impl<'a> Excerpt<'a> {
    /// Elision: the returned &str is tied to &self.
    fn first_word(&self) -> &str {
        self.sentence.split_whitespace().next().unwrap_or("")
    }
}

/// Generic + lifetime + trait bound together.
fn largest_by_len<'a, T: AsRef<str> + ?Sized>(items: &'a [&'a T]) -> Option<&'a T> {
    items.iter().copied().max_by_key(|s| s.as_ref().len())
}

fn main() {
    let a = String::from("a fairly long string");
    {
        let b = String::from("short");
        let result = longest(&a, &b);
        println!("longest: {result}");
    }

    let novel = String::from("Call me Ishmael. Some years ago, never mind how long precisely...");
    let first_sentence = novel.split('.').next().expect("no sentence");
    let excerpt = Excerpt { sentence: first_sentence };
    println!("{excerpt:?}, first word: {}", excerpt.first_word());

    let words = ["kiwi", "banana", "fig"];
    let refs: Vec<&str> = words.to_vec();
    println!("largest by length: {:?}", largest_by_len(&refs));
}
