# Temporal Focus

A minimalist desktop application that prompts you with a daily focus question and sets your response as your desktop wallpaper.

![Temporal Focus Screenshot](screenshot.png)

## Download

Choose the appropriate version for your Mac:

- **Intel Macs**: `Temporal Focus-1.1.0.dmg`
- **Apple Silicon Macs (M1/M2/M3)**: `Temporal Focus-1.1.0-arm64.dmg`

## Installation

1. Download the appropriate DMG file for your Mac
2. Double-click the DMG file to mount it
3. Drag "Temporal Focus" to your Applications folder
4. Launch the app from Applications

## Features

- **Daily Prompt**: Asks you "If today was the only day you worked this week, what would you want to ensure you got done?"
- **Multiple Focus Items**: Add multiple tasks with drag-and-drop reordering
- **Wallpaper Generation**: Creates a minimalist black wallpaper with your focus items
- **Smart Scheduling**: 
  - Appears when you open your laptop each day
  - Resets at midnight
  - Backup prompt at 10 AM if missed
- **Snooze Options**: Postpone for 30m, 1h, 2h, or 6h
- **Menu Bar Integration**: Lives quietly in your menu bar
- **Auto-Launch**: Automatically starts when you log in

## How It Works

### Daily Cycle
- **12:00 AM**: Daily state resets
- **Any time you open your laptop**: Shows prompt if not completed for the day
- **User Options**:
  - Complete focus → Set wallpaper, mark as done for day
  - Postpone → Hide for selected duration  
  - Cancel → Hide temporarily (will show again at backup time)
- **10:00 AM**: Backup prompt if still not completed

### Menu Bar
- Click the menu bar icon to manually open the focus prompt
- Right-click for options including "Launch at Login" and "Quit"

## Privacy

- All data is stored locally on your machine
- No internet connection required
- No tracking or analytics
- Wallpapers are saved to `~/Library/Application Support/temporal-focus/wallpapers/`

## System Requirements

- macOS 10.14 or later
- Intel or Apple Silicon processor

## Philosophy

Inspired by [temporal scarcity research](https://pubmed.ncbi.nlm.nih.gov/19121130/), this app encourages daily reflection on what truly matters. The minimalist design removes distractions, focusing your attention on intentional work.

*"If today was the only day you worked this week, what would you want to ensure you got done?"*

---

Built with Electron, TypeScript, and thoughtful design. Created with ♥ by [Seva](mailto:seva@sevamouler.com). 