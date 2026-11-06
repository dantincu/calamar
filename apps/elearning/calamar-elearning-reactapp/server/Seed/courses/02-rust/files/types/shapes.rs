use std::f64::consts::PI;

#[derive(Debug)]
enum Shape {
    Circle { radius: f64 },
    Rectangle { width: f64, height: f64 },
    Triangle(f64, f64, f64),
}

impl Shape {
    fn area(&self) -> f64 {
        match self {
            Shape::Circle { radius } => PI * radius * radius,
            Shape::Rectangle { width, height } => width * height,
            Shape::Triangle(a, b, c) => {
                // Heron's formula
                let s = (a + b + c) / 2.0;
                (s * (s - a) * (s - b) * (s - c)).sqrt()
            }
        }
    }

    fn describe(&self) -> String {
        match self {
            Shape::Circle { radius } if *radius > 10.0 => "a big circle".into(),
            Shape::Circle { .. } => "a circle".into(),
            Shape::Rectangle { width, height } if width == height => format!("a {width}x{width} square"),
            Shape::Rectangle { width, height } => format!("a {width}x{height} rectangle"),
            Shape::Triangle(a, b, c) if a == b && b == c => "an equilateral triangle".into(),
            Shape::Triangle(..) => "a triangle".into(),
        }
    }
}

fn classify(n: i32) -> &'static str {
    match n {
        i32::MIN..=-1 => "negative",
        0 => "zero",
        1 | 2 | 3 => "small",
        x if x % 2 == 0 => "large and even",
        _ => "large and odd",
    }
}

fn main() {
    let drawing = vec![
        Shape::Circle { radius: 1.5 },
        Shape::Circle { radius: 12.0 },
        Shape::Rectangle { width: 4.0, height: 4.0 },
        Shape::Rectangle { width: 2.0, height: 5.0 },
        Shape::Triangle(3.0, 4.0, 5.0),
    ];

    let mut total = 0.0;
    for shape in &drawing {
        println!("{:<28} area {:>8.2}", shape.describe(), shape.area());
        total += shape.area();
    }
    println!("total area: {total:.2}");

    for n in [-5, 0, 2, 10, 11] {
        println!("{n} is {}", classify(n));
    }
}
