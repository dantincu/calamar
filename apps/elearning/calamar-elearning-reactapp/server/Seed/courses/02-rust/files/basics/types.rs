fn main() {
    // Integers and explicit overflow handling.
    let big: u8 = 250;
    println!("checked:    {:?}", big.checked_add(10));    // None
    println!("wrapping:   {}", big.wrapping_add(10));     // 4
    println!("saturating: {}", big.saturating_add(10));   // 255

    // Floats and conversions.
    let count: i32 = 7;
    let average = 22.0 / count as f64;
    println!("average = {average:.3}");

    // char is Unicode.
    for c in ['a', 'ß', '🦀'] {
        println!("{c} takes {} bytes in UTF-8", c.len_utf8());
    }

    // Tuples.
    let (min, max) = min_max(&[3, 9, -2, 14, 5]);
    println!("min = {min}, max = {max}");

    // Arrays.
    let mut grid = [[0u8; 3]; 3];
    grid[1][1] = 5;
    println!("{grid:?}");
    println!("array length: {}", grid.len());
}

/// Returns a tuple: the smallest and the largest value.
fn min_max(values: &[i32]) -> (i32, i32) {
    let mut min = values[0];
    let mut max = values[0];
    for &v in values {
        if v < min { min = v; }
        if v > max { max = v; }
    }
    (min, max)
}
