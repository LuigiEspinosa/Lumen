# Tauri + React + Typescript

Lumen is a desktop Markdown note-taking app purpose-built for WSL2. It is an Obsidian-flavored editor with GitHub as the source of truth. Not a sync target.

Your notes live in a git repository (github.com/LuigiEspinosa/my-studies). Lumen opens that repo, watches for file changes, renders GitHub Flavored Markdown with pixel-accurate fidelity, visualizes note connections as a graph, and commits and pushes without leaving the editor. It runs as a native desktop window in WSL2 via WSLg (Windows Subsystem for Linux GUI), which ships with Windows 11. No browser tab, no server process, no Electron overhead. A single Tauri binary.

## The WSL Gap

Obsidian ships as a Windows or macOS binary. When run under WSLg it either refuses to start or cannot access the Linux filesystem correctly because it is a Windows process trying to read `\\wsl$\` paths. Lumen is compiled as a Linux binary, runs natively inside the WSL2 kernel, and accesses ~/notes (or any Linux path) with standard Linux file descriptors. The WSL filesystem issue does not exist.

## Features

- [ ] - Vault open: open any directory as a vault; remembers last opened vault on launch.
- [ ] - File tree sidebar: directory-aware, collapsible folders, new file / rename / delete.
- [ ] - GitHub Flavored Markdown editor: CodeMirror 6 with GFM syntax highlighting.
- [ ] - Split-pane live preview: editor left, rendered preview right, synchronized scroll.
- [ ] - GFM rendering: tables, task lists, fenced code blocks with syntax highlighting, strikethrough, footnotes, autolinks - pixel-accurate match to GitHub's renderer.
- [ ] - Backlinks panel: shows every note that links to the current file.
- [ ] - Graph view: force-directed node graph of all `[[wikilink]]` and relative `[text](path.md)` connections.
- [ ] - Command palette: fuzzy search over all commands `(Ctrl+P)`.
- [ ] - Full-text search: search across all notes in the vault `(Ctrl+Shift+F)` via tantivy.
- [ ] - Git integration: pull on open, commit + push on demand, sync status indicator, conflict detection.
- [ ] - GitHub token auth: Personal Access Token stored in system keyring (not plaintext config).
- [ ] - Wikilink support: `[[note name]]` links resolve to files, rendered as relative links in preview.
- [x] - Dark / light theme: GitHub's exact color tokens for both.
- [ ] - Keyboard-first: all core actions reachable without a mouse.

## Stack

| Decision | Chosen Over | Rationale |
|----|----|----|
| Tauri 2 | Electron | Electron bundles Chromium (~150MB) and a full Node.js runtime. Tauri uses the OS WebView (WebKitGTK on Linux) and a Rust backend - binary is ~8MB. More importantly: Tauri compiles to a Linux binary, which is what WSLg runs. Electron under WSLg has the same cross-boundary filesystem problem as Obsidian. |
| Rust Backend | Python, Node, Go | Tauri's backend IS Rust - it's not a separate process. The git2 crate (libgit2 bindings) handles Git operations without requiring a git binary on PATH. The tantivy crate is a full-text search engine in pure Rust - the same approach Zed uses. No second runtime to install. |
| React | Vue, Svelte | CodeMirror 6's best-maintained framework integration is @codemirror/react. CodeMirror is the editor - it's the most critical UI component in the entire app. The framework choice follows the editor, not the other way around. |
| CodeMirror 6 | Monaco (VS Code editor) | Monaco is designed for code editing and its Markdown support is secondary. CodeMirror 6 has a first-class Markdown mode with GFM extensions, inline decoration (bold renders bold in the editor, not **bold**), and a lezer parser that powers the graph link extraction. Monaco would fight the use case. |
| marked + highlight.js | remark, unified | GitHub itself uses a marked-compatible pipeline for GFM. marked with the gfm option enabled + highlight.js for code blocks produces rendering identical to github.com. The remark/rehype pipeline is more powerful but its GFM fidelity requires significant plugin configuration to match GitHub exactly. |
| git2 crate | child_process / git binary | git2 is libgit2 Rust bindings - no git binary on PATH required. Git operations (status, commit, push, pull) are library calls, not subprocess parsing. Error types are structured, not stdout strings. |
| tantivy | SQLite FTS5 | tantivy is a dedicated full-text search engine (think Lucene but Rust). It indexes incrementally on file change, handles stemming, and returns ranked results with highlighted excerpts. SQLite FTS5 works but tantivy gives VS Code / Zed quality search with minimal configuration. |
| GitHub PAT in system keyring | `~/.config/lumen/config.toml` plaintext | A Personal Access Token stored in plaintext in a config file is a credential leak waiting to happen - especially in a notes repo that gets pushed to GitHub. Tauri's stronghold plugin (or the secret-service crate on Linux) stores the token in GNOME Keyring / KWallet. It never touches disk as plaintext. |
| D3 force simulation | Cytoscape.js, vis.js | The graph has one job: show note connections as an interactive force-directed layout. D3's forceSimulation gives full control over node/link rendering with minimal bundle weight. Cytoscape is a full graph analysis library - overkill for a visual backlink map. |
| WSLg | Serve a web app, access via browser | A browser-based app (FastAPI + web frontend) would work but feels wrong for a daily writing tool. It requires a running server, opens in a tab not a window, and has no access to the system keyring. Tauri + WSLg gives a proper desktop window with a title bar, keyboard shortcuts, and native file dialogs. |

## Build Phases

| Phase | Description     | Status |
| ----- | --------------- | ------ |
| 1     | Scaffold & WSLg | Done   |

## Troubleshooting

### WSL Debian - GTK crashes on `pnpm tauri dev`

If the app crashes immediately with a `gdk-pixbuf-error-quark` or `No GSettings schemas are installed` error, the cause is Flatpak overwriting `XDG_DATA_DIRS` and stripping out `/usr/share`

Add the following to `~/.zshrc` (or `~/.bashrc` if using bash):

```bash
export XDG_DATA_DIRS="/usr/local/share:/usr/share:$XDG_DATA_DIRS"
export NO_AT_BRIDGE=1
export GDK_BACKEND=x11
```

Full root cause analysis and investigation steps: LuigiEspinosa/Lumen#6
