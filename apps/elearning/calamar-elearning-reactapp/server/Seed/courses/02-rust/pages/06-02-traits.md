A **trait** defines behaviour that types can share — similar to interfaces in other languages.

```rust
trait Summary {
    fn author(&self) -> String;

    // a default implementation, which can use the other methods
    fn summarize(&self) -> String {
        format!("(Read more from {}…)", self.author())
    }
}

struct Tweet { user: String, text: String }
struct Article { title: String, author: String }

impl Summary for Tweet {
    fn author(&self) -> String { format!("@{}", self.user) }
    fn summarize(&self) -> String { format!("{}: {}", self.author(), self.text) }
}

impl Summary for Article {
    fn author(&self) -> String { self.author.clone() }
    // uses the default summarize
}
```

## Traits as parameters

```rust
// static dispatch: one compiled copy per type
fn notify(item: &impl Summary) {
    println!("Breaking! {}", item.summarize());
}

// the same, written with a generic bound
fn notify_all<T: Summary>(items: &[T]) { … }
```

## Trait objects: `dyn Trait`

To keep values of **different** types in one collection, use a trait object — dispatch happens at run time through a vtable:

```rust
let feed: Vec<Box<dyn Summary>> = vec![
    Box::new(Tweet { … }),
    Box::new(Article { … }),
];
for item in &feed {
    println!("{}", item.summarize());
}
```

## Standard traits worth knowing

| Trait | Gives you |
|---|---|
| `Debug` / `Display` | `{:?}` / `{}` formatting |
| `Clone` / `Copy` | duplication |
| `PartialEq` / `Eq` / `PartialOrd` / `Ord` | comparisons and sorting |
| `Default` | `T::default()` |
| `From` / `Into` | conversions |
| `Iterator` | `for` loops and all the iterator methods |

Implementing `Display` for your own type lets it be used in `println!("{}")` — see the attached `traits.rs`.
