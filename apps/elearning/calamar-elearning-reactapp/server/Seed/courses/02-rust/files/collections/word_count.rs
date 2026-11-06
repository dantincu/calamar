use std::collections::{BTreeMap, HashMap, HashSet};

const TEXT: &str = "the quick brown fox jumps over the lazy dog the fox \
                    barks and the dog sleeps while the quick fox runs";

fn main() {
    // HashMap + entry API
    let mut counts: HashMap<&str, usize> = HashMap::new();
    for word in TEXT.split_whitespace() {
        *counts.entry(word).or_insert(0) += 1;
    }

    // Sort into a Vec: by count descending, then alphabetically.
    let mut ranked: Vec<(&str, usize)> = counts.into_iter().collect();
    ranked.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(b.0)));
    println!("top words:");
    for (word, n) in ranked.iter().take(5) {
        println!("  {word:<6} {n}");
    }

    // BTreeMap keeps keys sorted: group words by their length.
    let mut by_len: BTreeMap<usize, Vec<&str>> = BTreeMap::new();
    for word in TEXT.split_whitespace() {
        let group = by_len.entry(word.len()).or_default();
        if !group.contains(&word) {
            group.push(word);
        }
    }
    for (len, words) in &by_len {
        println!("{len} letters: {}", words.join(", "));
    }

    // HashSet for uniqueness.
    let unique: HashSet<&str> = TEXT.split_whitespace().collect();
    println!("{} words, {} unique", TEXT.split_whitespace().count(), unique.len());

    // Strings: build a new one.
    let mut acronym = String::new();
    for w in ["portable", "network", "graphics"] {
        acronym.push(w.chars().next().unwrap().to_ascii_uppercase());
    }
    println!("acronym: {acronym}");
}
