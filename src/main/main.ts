import { app, BrowserWindow, Tray, Menu, nativeImage, ipcMain, shell } from 'electron';
import * as path from 'path';
import { execSync } from 'child_process';
import Store from 'electron-store';
import * as cron from 'node-cron';
import * as fs from 'fs';

// Initialize store for saving settings
const store = new Store();

let mainWindow: BrowserWindow | null = null;
let tray: Tray | null = null;

function createWindow() {
  // Don't create a new window if one already exists and is visible
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.show();
    mainWindow.focus();
    mainWindow.setAlwaysOnTop(true, 'screen-saver');
    return;
  }

  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 500,
    height: 520,
    show: true,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    skipTaskbar: true, // Don't show in taskbar
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load the index.html file
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

  // Center window on screen
  mainWindow.center();

  // Move window 40px lower
  const [x, y] = mainWindow.getPosition();
  mainWindow.setPosition(x, y + 80);

  // Show window when ready and focus it
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
    mainWindow?.focus();
    // Ensure it's always on top and focused
    mainWindow?.setAlwaysOnTop(true, 'screen-saver');
    mainWindow?.focus();
    
    // Check if this is first run and show instructions
    const hasShownInstructions = store.get('hasShownInstructions', false) as boolean;
    if (!hasShownInstructions) {
      // Send instruction event to renderer
      mainWindow?.webContents.send('show-first-time-instructions');
      store.set('hasShownInstructions', true);
    }
  });

  // When window is closed, don't destroy it, just hide it
  mainWindow.on('close', (event) => {
    event.preventDefault();
    mainWindow?.hide();
  });
}

function setWallpaper(imagePath: string) {
  try {
    console.log('Setting wallpaper with path:', imagePath);
    // Verify file exists
    if (!fs.existsSync(imagePath)) {
      throw new Error(`Wallpaper file does not exist at path: ${imagePath}`);
    }

    // Convert to absolute path
    const absolutePath = path.resolve(imagePath);
    console.log('Absolute path:', absolutePath);
    
    // Get the user's home directory
    const homeDir = app.getPath('home');
    const dbPath = path.join(homeDir, 'Library/Application Support/Dock/desktoppicture.db');
    
    // First, try to set it using sqlite3
    try {
      // Update the database
      const updateCmd = `sqlite3 "${dbPath}" "update data set value = '${absolutePath}';"`;
      console.log('Running sqlite command:', updateCmd);
      execSync(updateCmd);
      
      // Restart Dock to apply changes
      execSync('killall Dock');
      console.log('Wallpaper set via sqlite3');
      return;
    } catch (sqliteError) {
      console.log('SQLite method failed:', sqliteError);
      console.log('Trying AppleScript method...');
    }

    // If sqlite fails, try AppleScript as fallback
    const script = `tell application "System Events" to tell every desktop to set picture to "${absolutePath}"`;
    console.log('Running AppleScript:', script);
    execSync(`osascript -e '${script}'`);
    console.log('Wallpaper set via AppleScript');
  } catch (error) {
    console.error('Error in setWallpaper:', error);
    throw error;
  }
}

function createTrayIcon() {
  console.log('Creating tray icon...');
  
  try {
    // Create fallback icon first
    const fallbackCanvas = `
      <svg width="16" height="16" xmlns="http://www.w3.org/2000/svg">
        <rect width="16" height="16" fill="#1a1a1a"/>
        <circle cx="8" cy="8" r="6" fill="#ffffff"/>
        <circle cx="8" cy="8" r="3" fill="#1a1a1a"/>
      </svg>
    `;
    let icon: Electron.NativeImage = nativeImage.createFromDataURL(`data:image/svg+xml;base64,${Buffer.from(fallbackCanvas).toString('base64')}`);
    
    // Try multiple possible icon paths
    const possiblePaths = [
      path.join(__dirname, '../../build/icons/icon.png'),    // Development
      path.join(process.resourcesPath, 'build/icons/icon.png'), // Production
      path.join(__dirname, '../assets/tray-icon.png'),  // Fallback to tray icon
    ];
    
    let iconFound = false;
    
    // Try each path until we find the icon
    for (const iconPath of possiblePaths) {
      console.log('Trying icon path:', iconPath);
      if (fs.existsSync(iconPath)) {
        console.log('Found icon file at:', iconPath);
        const tempIcon = nativeImage.createFromPath(iconPath);
        if (!tempIcon.isEmpty()) {
          icon = tempIcon;
          iconFound = true;
          break;
        }
      }
    }
    
    if (!iconFound) {
      console.log('Icon file not found, using fallback');
    }
    
    // Resize if needed
    if (!icon.isEmpty() && (icon.getSize().width > 22 || icon.getSize().height > 22)) {
      icon = icon.resize({ width: 16, height: 16 });
    }
    
    console.log('Creating tray with icon...');
    tray = new Tray(icon);
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Say Hi 👋',
        click: () => {
          require('electron').shell.openExternal('mailto:seva@sevamouler.com?subject=Temporal Focus Greetingzzz');
        }
      },
      {
        label: 'Learn the Science',
        click: () => {
          require('electron').shell.openExternal('https://pubmed.ncbi.nlm.nih.gov/19121130/');
        }
      },
      // { type: 'separator' },
      // {
      //   label: 'Launch at Login',
      //   type: 'checkbox',
      //   checked: app.getLoginItemSettings().openAtLogin,
      //   click: (menuItem) => {
      //     try {
      //       app.setLoginItemSettings({
      //         openAtLogin: menuItem.checked,
      //         name: 'Temporal Focus',
      //         path: process.execPath
      //       });
      //       console.log(`Login item ${menuItem.checked ? 'enabled' : 'disabled'}`);
      //     } catch (error) {
      //       console.error('Error setting login item:', error);
      //     }
      //   }
      // },
      { type: 'separator' },
      { 
        label: 'Quit Temporal Focus',
        click: () => {
          console.log('Menu item clicked: Quit');
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.destroy();
          }
          app.quit();
        }
      }
    ]);

    tray.setToolTip('Temporal Focus - Click to set your daily focus');
    tray.setContextMenu(contextMenu);
    
    // Add click handler for the tray icon
    tray.on('click', () => {
      console.log('Tray icon clicked');
      createWindow();
    });
    
    console.log('Tray icon created successfully!');
    
  } catch (error) {
    console.error('Error creating tray icon:', error);
  }
}

// Schedule the daily prompt with midnight reset
function schedulePrompt() {
  const defaultSchedule = '0 10 * * *';  // 10 AM backup
  const scheduledTime = store.get('scheduledTime', defaultSchedule) as string;
  
  // Get the local timezone
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  
  // Schedule midnight reset
  cron.schedule('0 0 * * *', () => {
    console.log('Midnight reset - clearing daily state');
    store.delete('dailyFocusCompleted');
    store.delete('lastSnoozeTime');
    // Show prompt immediately after midnight reset
    setTimeout(() => {
      checkAndShowPrompt();
    }, 1000);
  }, {
    scheduled: true,
    timezone,
    name: 'midnight-reset'
  } as cron.ScheduleOptions);
  
  // Schedule the backup prompt at 10 AM
  cron.schedule(scheduledTime, () => {
    checkAndShowPrompt();
  }, {
    scheduled: true,
    timezone,
    name: 'daily-prompt'
  } as cron.ScheduleOptions);

  // Check immediately on startup
  checkAndShowPrompt();
}

// Helper function to check if we need to show the prompt
function checkAndShowPrompt() {
  const now = new Date();
  const today = now.toDateString();
  
  const dailyCompleted = store.get('dailyFocusCompleted') as string | undefined;
  const lastSnoozeTime = store.get('lastSnoozeTime') as string | undefined;
  const lastCheckDate = store.get('lastCheckDate') as string | undefined;
  
  // Check if it's a new day since last check
  const isNewDay = !lastCheckDate || lastCheckDate !== today;
  
  if (isNewDay) {
    console.log('New day detected - clearing daily state and showing prompt');
    // Clear daily state on new day
    store.delete('dailyFocusCompleted');
    store.delete('lastSnoozeTime');
    store.set('lastCheckDate', today);
    
    // Show prompt for new day
    createWindow();
    return;
  }
  
  // Check if already completed today
  if (dailyCompleted === today) {
    console.log('Daily focus already completed for today');
    // In development mode (npm start), always show window anyway
    if (process.env.NODE_ENV !== 'production') {
      console.log('Development mode - showing window anyway');
      createWindow();
    }
    return;
  }
  
  // Check if currently snoozed
  if (lastSnoozeTime) {
    const snoozeEnd = new Date(lastSnoozeTime);
    if (now < snoozeEnd) {
      console.log('Currently snoozed until:', snoozeEnd.toLocaleString());
      return;
    }
  }
  
  console.log('Showing daily prompt - not completed and not snoozed');
  createWindow();
}

// Handle focus submission
ipcMain.on('submit-focus', async (_event: Electron.IpcMainEvent, data: { text: string, wallpaperDataUrl: string }) => {
  try {
    console.log('========== Focus Submission ==========');
    console.log('Focus text:', data.text);
    
    // Temporarily disable always on top to allow system dialogs
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(false);
    }
    
    // Mark as completed for today
    const today = new Date().toDateString();
    store.set('dailyFocusCompleted', today);
    store.delete('lastSnoozeTime'); // Clear any snooze
    
    // Save focus text and timestamp
    store.set('lastFocus', data.text);
    store.set('lastPromptDate', new Date().toISOString());

    // Convert data URL to image and save
    const base64Data = data.wallpaperDataUrl.replace(/^data:image\/png;base64,/, '');
    
    // Use app's user data directory for storing wallpapers
    const wallpaperDir = path.join(app.getPath('userData'), 'wallpapers');
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(wallpaperDir)) {
      console.log('Creating wallpaper directory:', wallpaperDir);
      fs.mkdirSync(wallpaperDir, { recursive: true });
    }

    // Create unique filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const wallpaperPath = path.join(wallpaperDir, `temporal-focus-${timestamp}.png`);
    console.log('Full wallpaper path:', wallpaperPath);
    
    // Write the file
    try {
      fs.writeFileSync(wallpaperPath, base64Data, 'base64');
      console.log('Wallpaper file written successfully');
      
      // Set file permissions to be readable by all
      fs.chmodSync(wallpaperPath, 0o644);
      
      // Verify file exists and has content
      const stats = fs.statSync(wallpaperPath);
      console.log('Wallpaper file size:', stats.size, 'bytes');
      
      if (stats.size === 0) {
        throw new Error('Wallpaper file was created but is empty');
      }
    } catch (writeError) {
      console.error('Error writing wallpaper file:', writeError);
      throw writeError;
    }

    // Clean up old wallpaper files (keep only the latest 5)
    try {
      const files = fs.readdirSync(wallpaperDir)
        .filter(file => file.startsWith('temporal-focus-') && file.endsWith('.png'))
        .map(file => ({
          name: file,
          path: path.join(wallpaperDir, file),
          mtime: fs.statSync(path.join(wallpaperDir, file)).mtime
        }))
        .sort((a, b) => b.mtime.getTime() - a.mtime.getTime());
      
      // Remove files beyond the latest 5
      files.slice(5).forEach(file => {
        fs.unlinkSync(file.path);
        console.log('Cleaned up old wallpaper:', file.name);
      });
    } catch (cleanupError) {
      console.log('Could not clean up old files:', cleanupError);
    }

    // Set wallpaper with simplified approach
    console.log('Setting wallpaper...');
    const absolutePath = path.resolve(wallpaperPath);
    
    // Use just AppleScript without clearing preferences first
    const script = `tell application "System Events" to tell every desktop to set picture to "${absolutePath}"`;
    console.log('Running AppleScript:', script);
    execSync(`osascript -e '${script}'`);
    
    console.log('Wallpaper set successfully');
    
    // Don't show desktop yet - wait for hide-window event
    console.log('Waiting for animation to complete before showing desktop...');
    
    console.log('===================================');
    
  } catch (error) {
    console.error('Error in submit-focus:', error);
    // Re-enable always on top even if there was an error
    if (mainWindow) {
      mainWindow.setAlwaysOnTop(true, 'screen-saver');
    }
  }
});

// Handle window hide request
ipcMain.on('hide-window', () => {
  console.log('Hide window requested');
  if (mainWindow) {
    mainWindow.hide();
    console.log('Window hidden after confetti animation');
    
    // Now show the desktop
    try {
      // Method 1: Try Mission Control to show desktop (like 4-finger swipe)
      try {
        execSync('osascript -e \'tell application "System Events" to key code 103\''); // F11 key
        console.log('Desktop shown via Mission Control (F11)');
      } catch (missionControlError) {
        // Method 2: Try hiding all application windows
        try {
          execSync('osascript -e \'tell application "System Events" to set visible of every application process whose visible is true to false\'');
          console.log('Desktop shown - all applications hidden');
        } catch (hideError) {
          // Method 3: Just show notification
          execSync(`osascript -e 'display notification "Your focus wallpaper has been set! Check your desktop 🎯" with title "Temporal Focus"'`);
          console.log('Desktop notification shown successfully');
        }
      }
    } catch (desktopError) {
      console.log('Could not show desktop or notification:', desktopError);
      console.log('Wallpaper set successfully - check your desktop!');
    }
  }
});

// Handle snooze
ipcMain.on('snooze', (_event: Electron.IpcMainEvent, minutes: number) => {
  const snoozeUntil = new Date(Date.now() + minutes * 60 * 1000);
  store.set('lastSnoozeTime', snoozeUntil.toISOString());
  console.log(`Snoozed for ${minutes} minutes until:`, snoozeUntil.toLocaleString());
  
  if (mainWindow) {
    mainWindow.hide();
  }
  
  // Schedule to show again after snooze
  setTimeout(() => {
    checkAndShowPrompt();
  }, minutes * 60 * 1000);
});

// App initialization
app.whenReady().then(async () => {
  console.log('========== Temporal Focus Starting ==========');
  console.log('Current time:', new Date().toLocaleString());
  console.log('Environment:', process.env.NODE_ENV || 'development');
  
  // Hide from dock completely
  if (process.platform === 'darwin') {
    app.dock.hide();
  }

  // Enable launch at login by default
  try {
    app.setLoginItemSettings({
      openAtLogin: true,
      name: 'Temporal Focus',
      path: process.execPath
    });
  } catch (error) {
    console.log('Could not set login item:', error);
  }

  // Create assets directory if it doesn't exist
  const assetsDir = path.join(__dirname, '../assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  // Create tray icon first before creating any windows
  createTrayIcon();
  
  // Schedule daily prompt (includes immediate check)
  schedulePrompt();
  
  // In development mode, always show window immediately
  if (!process.env.NODE_ENV || process.env.NODE_ENV === 'development') {
    console.log('Development mode - showing window immediately');
    setTimeout(() => {
      createWindow();
    }, 1000); // Small delay to ensure tray is created first
  }
  
  console.log('Initialization complete');
  console.log('=====================================');

  app.on('activate', () => {
    // On macOS, create window on activate for immediate visibility
    createWindow();
  });
});

app.on('window-all-closed', () => {
  // Keep the app running even when all windows are closed (menu bar app)
  console.log('All windows closed, but keeping app running');
});

// Prevent the app from quitting when all windows are closed
app.on('before-quit', () => {
  console.log('App is about to quit');
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
  }
}); 