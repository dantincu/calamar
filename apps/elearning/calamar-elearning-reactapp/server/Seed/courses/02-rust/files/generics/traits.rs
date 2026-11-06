use std::fmt;

trait Summary {
    fn author(&self) -> String;

    fn summarize(&self) -> String {
        format!("(Read more from {}...)", self.author())
    }
}

struct Tweet {
    user: String,
    text: String,
    likes: u32,
}

struct Article {
    title: String,
    author: String,
    words: usize,
}

impl Summary for Tweet {
    fn author(&self) -> String {
        format!("@{}", self.user)
    }
    fn summarize(&self) -> String {
        format!("{}: {} [{} likes]", self.author(), self.text, self.likes)
    }
}

impl Summary for Article {
    fn author(&self) -> String {
        self.author.clone()
    }
    // summarize() comes from the default implementation
}

// Display lets the type be printed with {}.
impl fmt::Display for Article {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "\"{}\" by {} ({} words)", self.title, self.author, self.words)
    }
}

/// Static dispatch with impl Trait.
fn notify(item: &impl Summary) {
    println!("Breaking news! {}", item.summarize());
}

/// A generic function with two bounds.
fn print_twice<T: Summary + fmt::Display>(item: &T) {
    println!("{item}");
    println!("{}", item.summarize());
}

fn main() {
    let tweet = Tweet { user: "rustlang".into(), text: "Rust 2024 edition is here!".into(), likes: 4200 };
    let article = Article { title: "Why ownership matters".into(), author: "Ferris".into(), words: 1800 };

    notify(&tweet);
    notify(&article);
    print_twice(&article);

    // Dynamic dispatch: different types in one Vec.
    let feed: Vec<Box<dyn Summary>> = vec![Box::new(tweet), Box::new(article)];
    println!("--- feed ---");
    for item in &feed {
        println!("{}", item.summarize());
    }
}
