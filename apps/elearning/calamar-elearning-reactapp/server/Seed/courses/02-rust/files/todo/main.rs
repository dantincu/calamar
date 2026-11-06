use std::fmt;
use std::fs;
use std::io;
use std::process::ExitCode;

const FILE: &str = "todo.txt";

#[derive(Debug, Clone, PartialEq)]
struct Task {
    id: u32,
    title: String,
    done: bool,
}

#[derive(Debug, PartialEq)]
enum Command {
    Add(String),
    Done(u32),
    Remove(u32),
    List,
    Help,
}

#[derive(Debug)]
enum TodoError {
    Io(io::Error),
    Usage(String),
    NoSuchTask(u32),
    Corrupt { line: usize },
}

impl fmt::Display for TodoError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            TodoError::Io(e) => write!(f, "file error: {e}"),
            TodoError::Usage(msg) => write!(f, "{msg} (try `todo help`)"),
            TodoError::NoSuchTask(id) => write!(f, "there is no task {id}"),
            TodoError::Corrupt { line } => write!(f, "{FILE} is damaged at line {line}"),
        }
    }
}

impl From<io::Error> for TodoError {
    fn from(e: io::Error) -> Self {
        TodoError::Io(e)
    }
}

fn parse_id(text: &str) -> Result<u32, TodoError> {
    text.parse().map_err(|_| TodoError::Usage(format!("'{text}' is not a task number")))
}

fn parse_command(args: &[String]) -> Result<Command, TodoError> {
    let words: Vec<&str> = args.iter().map(String::as_str).collect();
    match words.as_slice() {
        [] | ["help"] => Ok(Command::Help),
        ["list"] => Ok(Command::List),
        ["add", rest @ ..] if !rest.is_empty() => Ok(Command::Add(rest.join(" "))),
        ["done", id] => Ok(Command::Done(parse_id(id)?)),
        ["remove", id] => Ok(Command::Remove(parse_id(id)?)),
        [other, ..] => Err(TodoError::Usage(format!("unknown or incomplete command '{other}'"))),
    }
}

struct TaskList {
    tasks: Vec<Task>,
}

impl TaskList {
    fn load() -> Result<Self, TodoError> {
        let text = match fs::read_to_string(FILE) {
            Ok(t) => t,
            Err(e) if e.kind() == io::ErrorKind::NotFound => String::new(),
            Err(e) => return Err(e.into()),
        };
        let tasks = text
            .lines()
            .enumerate()
            .filter(|(_, l)| !l.trim().is_empty())
            .map(|(i, line)| {
                let mut parts = line.splitn(3, '|');
                match (parts.next(), parts.next(), parts.next()) {
                    (Some(id), Some(done), Some(title)) => Ok(Task {
                        id: id.parse().map_err(|_| TodoError::Corrupt { line: i + 1 })?,
                        done: done == "1",
                        title: title.to_string(),
                    }),
                    _ => Err(TodoError::Corrupt { line: i + 1 }),
                }
            })
            .collect::<Result<Vec<_>, _>>()?;
        Ok(TaskList { tasks })
    }

    fn save(&self) -> Result<(), TodoError> {
        let text: String = self
            .tasks
            .iter()
            .map(|t| format!("{}|{}|{}\n", t.id, if t.done { 1 } else { 0 }, t.title))
            .collect();
        fs::write(FILE, text)?;
        Ok(())
    }

    fn add(&mut self, title: String) -> &Task {
        let id = self.tasks.iter().map(|t| t.id).max().unwrap_or(0) + 1;
        self.tasks.push(Task { id, title, done: false });
        self.tasks.last().unwrap()
    }

    fn find_mut(&mut self, id: u32) -> Result<&mut Task, TodoError> {
        self.tasks.iter_mut().find(|t| t.id == id).ok_or(TodoError::NoSuchTask(id))
    }

    fn complete(&mut self, id: u32) -> Result<(), TodoError> {
        self.find_mut(id)?.done = true;
        Ok(())
    }

    fn remove(&mut self, id: u32) -> Result<Task, TodoError> {
        let index = self.tasks.iter().position(|t| t.id == id).ok_or(TodoError::NoSuchTask(id))?;
        Ok(self.tasks.remove(index))
    }
}

fn run(args: &[String]) -> Result<(), TodoError> {
    let command = parse_command(args)?;
    let mut list = TaskList::load()?;

    match command {
        Command::Help => {
            println!("usage: todo add <title> | done <id> | remove <id> | list");
            return Ok(());
        }
        Command::List => {
            if list.tasks.is_empty() {
                println!("Nothing to do!");
            }
            for t in &list.tasks {
                println!("{:>3} [{}] {}", t.id, if t.done { 'x' } else { ' ' }, t.title);
            }
            return Ok(());
        }
        Command::Add(title) => {
            let task = list.add(title);
            println!("Added task {}: {}", task.id, task.title);
        }
        Command::Done(id) => {
            list.complete(id)?;
            println!("Completed task {id}");
        }
        Command::Remove(id) => {
            let task = list.remove(id)?;
            println!("Removed task {}", task.id);
        }
    }
    list.save()
}

fn main() -> ExitCode {
    let args: Vec<String> = std::env::args().skip(1).collect();
    match run(&args) {
        Ok(()) => ExitCode::SUCCESS,
        Err(e) => {
            eprintln!("error: {e}");
            ExitCode::FAILURE
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn args(s: &str) -> Vec<String> {
        s.split_whitespace().map(String::from).collect()
    }

    #[test]
    fn parses_commands() {
        assert_eq!(parse_command(&args("add buy milk")).unwrap(), Command::Add("buy milk".into()));
        assert_eq!(parse_command(&args("done 3")).unwrap(), Command::Done(3));
        assert_eq!(parse_command(&args("")).unwrap(), Command::Help);
        assert!(parse_command(&args("done x")).is_err());
    }

    #[test]
    fn adds_and_removes() {
        let mut list = TaskList { tasks: vec![] };
        list.add("a".into());
        list.add("b".into());
        list.complete(1).unwrap();
        assert!(list.tasks[0].done);
        assert_eq!(list.remove(2).unwrap().title, "b");
        assert!(matches!(list.remove(9), Err(TodoError::NoSuchTask(9))));
    }
}
