The recommended way to install Rust is **rustup**.

## Linux and macOS

```bash
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
```

## Windows

Download and run `rustup-init.exe` from [rustup.rs](https://rustup.rs). It will offer to install the *Visual Studio C++ Build Tools*, which Rust needs for linking — accept.

## Check the installation

Open a **new** terminal:

```bash
rustc --version
cargo --version
```

## Keeping up to date

Rust releases a new stable version every six weeks:

```bash
rustup update
```

## Recommended editor setup

- **VS Code** with the **rust-analyzer** extension: completion, inline types, go-to-definition, inline errors.
- `rustfmt` formats your code (`cargo fmt`) and `clippy` gives extra lint advice (`cargo clippy`). Both are installed by rustup.

## Offline documentation

```bash
rustup doc --book   # "The Rust Programming Language", in your browser
rustup doc --std    # the standard library reference
```
