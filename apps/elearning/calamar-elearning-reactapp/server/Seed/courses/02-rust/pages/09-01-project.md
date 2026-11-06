You will build `todo`, a command-line task manager that stores its tasks in a text file.

```text
$ todo add "Write the report"
Added task 1: Write the report
$ todo add "Call the bank"
Added task 2: Call the bank
$ todo done 1
Completed task 1
$ todo list
  1 [x] Write the report
  2 [ ] Call the bank
$ todo remove 2
Removed task 2
```

## Design

| Part | Rust concepts |
|---|---|
| `struct Task { id, title, done }` | structs, derives |
| `enum Command { Add(String), Done(u32), Remove(u32), List, Help }` | enums carrying data |
| Parsing `std::env::args()` into a `Command` | slices, `match` on tuples, `Result` |
| `enum TodoError` with `Display` and `From<io::Error>` | custom errors, the `?` operator |
| Loading and saving `todo.txt` | `fs`, string processing, iterators |
| `TaskList` with methods `add`, `complete`, `remove` | `impl` blocks, `Vec`, `iter().position`, `Option` |

The file format is one task per line: `id|done|title`, for example `1|1|Write the report`.

## Steps

1. `cargo new todo` and replace `Cargo.toml` and `src/main.rs` with the attached files.
2. Run it with arguments: `cargo run -- add "Learn Rust"`, `cargo run -- list`.
3. Read the code from `main` downwards. Each function is short and uses something from this course.

## Extend it

1. Add a `clear` command removing all completed tasks (hint: `Vec::retain`).
2. Add **priorities** (`--high`) and list high-priority tasks first (`sort_by_key`).
3. Store the tasks as JSON using the `serde` and `serde_json` crates.
4. Use the `clap` crate for argument parsing with automatic `--help`.
5. Write unit tests for `parse_command` and `TaskList` in a `#[cfg(test)] mod tests` and run `cargo test`.

Congratulations on finishing the course! 🦀
