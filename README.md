# Money Management

A desktop and mobile port of `Money-2.xlsx`: a money management calculator for
binary-options trading. Given an initial capital, a number of trades, a target
number of wins, a winning ratio (percentage/quota), and a reinvestment
percentage, it computes the stake for each trade so that hitting the target win
count within the trade count returns a fixed, predictable profit — regardless
of the order wins and losses occur in. A session ends as soon as the win target
is reached (won) or too many losses make it unreachable (lost).

Built with Electron + React + TypeScript so the same codebase is packaged for
Windows (electron-builder) and Android (Capacitor), and can target macOS later.

## Development

```
npm install
npm test          # unit tests for the calculation engine
npm run electron:dev   # run the desktop app locally
```

## Building the Windows installer

```
npm run dist:win
```

Produces an NSIS installer and a portable `.exe` in `release/`. This also runs
automatically on GitHub Actions (`.github/workflows/build-windows.yml`) on
every push to `main` and on version tags (`v*`), which also attaches the
installer to the GitHub Release.

## Building the Android APK

```
npm run android:apk
```

Produces a debug APK at `android/app/build/outputs/apk/debug/app-debug.apk`.
This also runs on GitHub Actions (`.github/workflows/build-android.yml`) and
uploads the APK as a build artifact.

## Project structure

- `src/lib/engine.ts` — the calculation engine, ported from the workbook's
  hidden "Dollar MM1" sheet and verified against its cached values in
  `src/lib/engine.test.ts`. Framework-agnostic, reused as-is by every build.
- `src/components/` — the UI: input form, plan summary, trade log, stats.
- `electron/` — the Electron main/preload processes.
- `android/` — the Capacitor Android project.
- `Money-2.xlsx` — the original spreadsheet this app replicates.
