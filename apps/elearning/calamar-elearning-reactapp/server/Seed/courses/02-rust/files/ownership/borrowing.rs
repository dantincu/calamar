/// Shared borrow: read only.
fn word_count(text: &String) -> usize {
    text.split_whitespace().count()
}

/// Mutable borrow: the caller keeps ownership, we change the value in place.
fn capitalize_words(text: &mut String) {
    let result: Vec<String> = text
        .split_whitespace()
        .map(|w| {
            let mut chars = w.chars();
            match chars.next() {
                Some(first) => first.to_uppercase().collect::<String>() + chars.as_str(),
                None => String::new(),
            }
        })
        .collect();
    *text = result.join(" ");
}

fn main() {
    let mut sentence = String::from("rust makes systems programming fun");

    // Many shared borrows at once are fine.
    let a = &sentence;
    let b = &sentence;
    println!("{} words: {a} / {b}", word_count(&sentence));

    // One mutable borrow (a and b are no longer used, so this is allowed).
    capitalize_words(&mut sentence);
    println!("{sentence}");

    // Uncomment to see the borrow checker prevent a dangling reference:
    // let mut v = vec![1, 2, 3];
    // let first = &v[0];
    // v.push(4);
    // println!("{first}");
}
