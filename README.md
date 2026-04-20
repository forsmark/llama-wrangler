# Llama Wrangler

Desktop GUI for building `llama-server` launch commands. Stop hand-crafting long flag strings.

![Overview](demo/01-overview.png)

## Features

- **Hardware detection** — auto-detects NVIDIA/AMD/Vulkan GPU, VRAM, RAM, CPU threads, and `llama-server` binary on startup
- **Model picker** — native file dialog for GGUF files; parses filename to infer size and quantization automatically
- **VRAM fit badge** — estimates model memory usage vs available VRAM (green < 80%, amber 80–100%, red > 100%)
- **Live command preview** — updates as you change params; copy to clipboard in one click
- **Curated + Advanced params** — 15 essential flags shown by default; full flag set available via Advanced toggle, grouped by category
- **Presets** — save/load/delete named configurations; import/export as JSON
- **Manual override** — override any detected hardware field if detection is wrong

## Screenshots

| Single-line command | Multi-line format |
|---|---|
| ![Command](demo/02-command-built.png) | ![Multi-line](demo/03-multiline.png) |

![Advanced params](demo/04-advanced-params.png)

## Requirements

- [llama.cpp](https://github.com/ggml-org/llama.cpp) — `llama-server` must be in `$PATH` (or set manually in Hardware panel)
- Node.js 18+ / [Bun](https://bun.sh)

## Development

```bash
bun install
bun run dev        # launch Electron app in dev mode
bun run build      # production build
bun run test       # unit + integration tests (Vitest)
xvfb-run bun run test:e2e  # E2E tests (Playwright, requires display)
```

## Project structure

```
src/
  main/            Electron main process
    detect/        GPU/RAM/CPU hardware detection
    storage/       Atomic JSON persistence (presets, settings)
    ipc/           Typed IPC handler registry
  preload/         contextBridge API surface
  renderer/
    features/      UI feature components (hardware, model, params, fit, command, presets)
    data/          Parameter schema, VRAM estimates, quant map
    lib/           Pure logic (command builder, GGUF name parser, validator)
    state/         Zustand store
shared/
  types.ts         Shared types (HardwareInfo, Preset, ParamDef, …)
```

## Tech stack

Electron · React 19 · TypeScript · electron-vite · Tailwind CSS v4 · shadcn/ui · Zustand · Vitest · Playwright
