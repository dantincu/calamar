use std::collections::HashMap;

#[derive(Debug, Clone)]
struct Employee {
    name: &'static str,
    department: &'static str,
    salary: u32,
}

/// A custom iterator: implement next() and get every adapter for free.
struct Fibonacci {
    current: u64,
    next: u64,
}

impl Iterator for Fibonacci {
    type Item = u64;
    fn next(&mut self) -> Option<u64> {
        let value = self.current;
        self.current = self.next;
        self.next += value;
        Some(value)
    }
}

fn fibonacci() -> Fibonacci {
    Fibonacci { current: 0, next: 1 }
}

fn main() {
    let staff = vec![
        Employee { name: "Ada", department: "Engineering", salary: 120 },
        Employee { name: "Grace", department: "Engineering", salary: 135 },
        Employee { name: "Linus", department: "Operations", salary: 98 },
        Employee { name: "Margaret", department: "Research", salary: 142 },
        Employee { name: "Ken", department: "Operations", salary: 91 },
    ];

    // filter + map + collect
    let well_paid: Vec<&str> = staff.iter().filter(|e| e.salary > 100).map(|e| e.name).collect();
    println!("salary > 100: {well_paid:?}");

    // fold into a HashMap: total salary per department
    let per_department = staff.iter().fold(HashMap::new(), |mut acc: HashMap<&str, u32>, e| {
        *acc.entry(e.department).or_default() += e.salary;
        acc
    });
    let mut departments: Vec<_> = per_department.into_iter().collect();
    departments.sort();
    println!("per department: {departments:?}");

    // max_by_key, position, any, all
    let top = staff.iter().max_by_key(|e| e.salary).unwrap();
    println!("top earner: {}", top.name);
    println!("everyone earns > 90: {}", staff.iter().all(|e| e.salary > 90));
    println!("index of Linus: {:?}", staff.iter().position(|e| e.name == "Linus"));

    // closures capturing their environment
    let raise_percent = 10;
    let raised: Vec<u32> = staff.iter().map(|e| e.salary * (100 + raise_percent) / 100).collect();
    println!("after a {raise_percent}% raise: {raised:?}");

    // enumerate + zip
    for (i, (e, new)) in staff.iter().zip(&raised).enumerate() {
        println!("{}. {:<9} {} -> {}", i + 1, e.name, e.salary, new);
    }

    // A lazy, infinite custom iterator.
    let even_fibs: Vec<u64> = fibonacci().filter(|n| n % 2 == 0).take_while(|&n| n < 10_000).collect();
    println!("even Fibonacci numbers below 10 000: {even_fibs:?}");

    // collect into a Result: stops at the first error
    let parsed: Result<Vec<i32>, _> = "4 8 15 16 23 42".split(' ').map(str::parse::<i32>).collect();
    println!("parsed: {parsed:?}");
}
