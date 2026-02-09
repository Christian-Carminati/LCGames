# C64 Score Extraction System

This document explains how the automatic high-score extraction works for the C64 emulator. The system reads directly from the emulator's RAM to capture the current score, preventing the need for file saves which can be unreliable.

## Overview

1.  **Configuration**: Each game in `games.json` defines where its score is located in the C64 memory.
2.  **Emulator Probe**: The `emulator.html` file runs a script that locates the C64 RAM within the browser's memory (WebAssembly Heap).
3.  **Extraction**: Every second, the script reads the configured memory address, decodes the value (Integer, BCD, or String), and sends it to the React application.
4.  **Submission**: When the user clicks "SUBMIT SCORE", the *last captured value* is sent to the server.

## Configuration Guide (`games.json`)

To enable score tracking for a game, add a `scoreConfig` object to its entry in `src/lib/games.json`.

```json
{
  "title": "Example Game",
  "romPath": "/roms/example.d64",
  "scoreConfig": {
    "address": "0x0800",  // The memory address (Hex) where score starts
    "type": "byte",     // Format: "byte", "int", "bcd", or "string"
    "length": 1,        // Number of bytes to read
    "baseOffset": "0x1000", // Optional: Add strict offset to address
    "endianness": "little"  // Optional: "big" (default) or "little"
  }
}
```

### Supported Types

| Type | Description | Example |
| :--- | :--- | :--- |
| `byte` | Single byte integer (0-255). | `0x10` -> 16 points |
| `int` | Little-endian integer (multiple bytes). | `0x01 0x00` -> 1 point (depending on endianness) |
| `bcd` | Binary Coded Decimal. Common in retro games. | `0x12 0x34` -> 1234 points |
| `string` | ASCII/PETSCII string of digits. | `"001250"` -> 1250 points |

## How to Find Score Addresses

Since we don't have a debugger in the web player, you must find these addresses using a local emulator like VICE or CCS64:

1.  Open the game in **VICE**.
2.  Open the **Monitor** (Alt+H).
3.  Play until you get points (e.g., score becomes 10).
4.  Search memory: `h 0000 ffff 0a` (Search for byte 10).
5.  Gain more points (e.g., score 20).
6.  Search again among previous candidates.
7.  Once found, note the address (e.g., `0800` or `E3A3`).
8.  Determine the format:
    *   If score 10 is `0x0A` -> **byte/int**.
    *   If score 10 is `0x10` -> **BCD**.
    *   If score is a string of numbers -> **string**.

## Architecture Details

### `public/emulator.html`

This file hosts the EmulatorJS iframe. It contains the critical logic for bridging the gap between the Emulator's WebAssembly core and our JavaScript code.

**Key Function: `findEmulatorHeap()`**
We inspect two common locations for the Emscripten memory heap:
*   `window.Module.HEAPU8` (Standard Emscripten)
*   `window.EJS_emulator.Module.HEAPU8` (EmulatorJS wrapper)

**Key Function: `readScore()`**
Reads `length` bytes from `scoreConfig.address` and parses them according to `scoreConfig.type`.

### `src/components/ScoreBoard.tsx`

Handles the submission.
*   If `isAutoTracked` is true, the **Score Input** is locked.
*   The `capturedScore` prop (passed from the emulator) is used as the **only** source of truth for the score value.
*   The user only inputs their **NAME**.

## Troubleshooting

*   **Score shows 0**: Address might be wrong, or the game uses a visible screen buffer (Screen RAM) vs internal variable. Try finding the internal variable.
*   **Sync Failed**: Often due to 500 errors if the server logic for saving is broken. Check `api/scores/route.ts`.
