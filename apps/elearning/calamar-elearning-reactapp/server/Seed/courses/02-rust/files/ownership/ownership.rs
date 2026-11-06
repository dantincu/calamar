#[derive(Debug)]
struct Resource {
    name: String,
}

// Drop runs when the owner goes out of scope: watch the order of the messages.
impl Drop for Resource {
    fn drop(&mut self) {
        println!("  dropping {}", self.name);
    }
}

fn take(r: Resource) {
    println!("  take() now owns {}", r.name);
} // r is dropped here

fn take_and_give_back(r: Resource) -> Resource {
    println!("  borrowing nothing, moving {} in and out", r.name);
    r
}

fn main() {
    println!("1. scope:");
    {
        let _a = Resource { name: "a".into() };
        println!("  a is alive");
    }

    println!("2. move into a function:");
    let b = Resource { name: "b".into() };
    take(b);
    // println!("{:?}", b); // ❌ uncomment: value used after move

    println!("3. move in and back out:");
    let c = Resource { name: "c".into() };
    let c = take_and_give_back(c);
    println!("  still have {:?}", c);

    println!("4. Copy types are copied:");
    let x = 42;
    let y = x;
    println!("  x = {x}, y = {y}");

    println!("5. clone is an explicit deep copy:");
    let s1 = String::from("hello");
    let s2 = s1.clone();
    println!("  {s1} / {s2}");

    println!("end of main:");
} // c is dropped here
