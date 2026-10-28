# baronrobin

My terminal business card. Run it with npx, nothing to install:

```sh
npx baronrobin
```
```

╭────────────────────────────────────────────────────────╮
│                                                        │
│   Robin Baron                                          │
│   3D Generalist · Kaiserslautern, Germany              │
│                                                        │
│   Unreal Engine, Houdini and real-time work,           │
│   from arch viz to VFX and live event tech.            │
│                                                        │
│   Web        https://baronrobin.com                    │
│   GitHub     https://github.com/BaronRobin             │
│   LinkedIn   https://www.linkedin.com/in/baron-robin   │
│   Email      robinbaron@icloud.com                     │
│   Instagram  @phtorob                                  │
│                                                        │
│   Skills     Unreal Engine · Blender · Houdini         │
│              TouchDesigner · After Effects             │
│              DaVinci Resolve · Photoshop               │
│                                                        │
╰────────────────────────────────────────────────────────╯
```

## Options

| Flag | What it does |
|---|---|
| `--json` | Print the card data as JSON |
| `--no-color` | Disable colours. Colours are also off with `NO_COLOR=1` or when the output is piped |
| `-h`, `--help` | Show help |
| `-v`, `--version` | Print the version |

## How it is built

Plain ESM JavaScript with zero dependencies, so `npx` stays fast. The ANSI
codes are written by hand and the box is measured from the lines' visible
width, so it lines up with colours on or off. If the terminal is narrower
than the box, the border is dropped instead of wrapping.

```sh
npm test          # node --test
node bin/cli.mjs  # run locally
```

The content lives in `src/data.mjs` and mirrors [baronrobin.com](https://baronrobin.com).

## License

MIT
