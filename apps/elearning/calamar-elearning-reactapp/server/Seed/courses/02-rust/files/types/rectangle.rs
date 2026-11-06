#[derive(Debug, Clone, PartialEq)]
struct Rectangle {
    width: f64,
    height: f64,
}

impl Rectangle {
    fn new(width: f64, height: f64) -> Self {
        assert!(width >= 0.0 && height >= 0.0, "sizes can't be negative");
        Self { width, height }
    }

    fn square(size: f64) -> Self {
        Self::new(size, size)
    }

    fn area(&self) -> f64 {
        self.width * self.height
    }

    fn perimeter(&self) -> f64 {
        2.0 * (self.width + self.height)
    }

    fn can_hold(&self, other: &Rectangle) -> bool {
        self.width > other.width && self.height > other.height
    }

    fn scale(&mut self, factor: f64) {
        self.width *= factor;
        self.height *= factor;
    }
}

fn main() {
    let mut big = Rectangle::new(30.0, 50.0);
    let small = Rectangle::square(10.0);

    println!("{big:?}");
    println!("area = {}, perimeter = {}", big.area(), big.perimeter());
    println!("big can hold small: {}", big.can_hold(&small));

    big.scale(0.25);
    println!("after scaling: {big:#?}");
    println!("big can hold small now: {}", big.can_hold(&small));

    let copy = small.clone();
    println!("clone equals original: {}", copy == small);
}
