use std::fmt;
use std::fs;

#[derive(Debug)]
enum ScoreError {
    Io(std::io::Error),
    Parse { line: usize, text: String },
    Empty,
}

impl fmt::Display for ScoreError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ScoreError::Io(e) => write!(f, "could not read the scores: {e}"),
            ScoreError::Parse { line, text } => write!(f, "line {line}: '{text}' is not a score"),
            ScoreError::Empty => write!(f, "there are no scores"),
        }
    }
}

impl std::error::Error for ScoreError {}

impl From<std::io::Error> for ScoreError {
    fn from(e: std::io::Error) -> Self {
        ScoreError::Io(e)
    }
}

/// Every `?` either yields the value or returns a ScoreError.
fn average_score(path: &str) -> Result<f64, ScoreError> {
    let text = fs::read_to_string(path)?; // io::Error -> ScoreError via From

    let mut scores = Vec::new();
    for (i, line) in text.lines().enumerate() {
        let line = line.trim();
        if line.is_empty() {
            continue;
        }
        let score: f64 = line
            .parse()
            .map_err(|_| ScoreError::Parse { line: i + 1, text: line.to_string() })?;
        scores.push(score);
    }

    if scores.is_empty() {
        return Err(ScoreError::Empty);
    }
    Ok(scores.iter().sum::<f64>() / scores.len() as f64)
}

fn main() -> Result<(), Box<dyn std::error::Error>> {
    fs::write("good.txt", "7.5\n9\n8.25\n")?;
    fs::write("bad.txt", "7\nnine\n8\n")?;
    fs::write("empty.txt", "\n\n")?;

    for file in ["good.txt", "bad.txt", "empty.txt", "missing.txt"] {
        match average_score(file) {
            Ok(avg) => println!("{file}: average {avg:.2}"),
            Err(ScoreError::Empty) => println!("{file}: nothing to average"),
            Err(e) => println!("{file}: {e}"),
        }
    }

    for file in ["good.txt", "bad.txt", "empty.txt"] {
        fs::remove_file(file)?;
    }
    Ok(())
}
