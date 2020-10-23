const { app, BrowserWindow, Menu } = require("electron");

process.env.NODE_ENV = "production";

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      enableRemoteModule: true,
    },
  });

  mainWindow.on("closed", function () {
    app.quit();
  });

  mainWindow.loadFile("index.html");
  //mainWindow.webContents.openDevTools();

  // Build Menu from Template
  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  Menu.setApplicationMenu(mainMenu);
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// menu template
const mainMenuTemplate = [
  // {
  //   label: "File",
  //   submenu: [
  //     // {
  //     //   label: "Add Item",
  //     //   click() {
  //     //     createAddWindow();
  //     //   },
  //     // },
  //     // {
  //     //   label: "Clear Items",
  //     //   click() {
  //     //     mainWindow.webContents.send("item:clear");
  //     //   },
  //     // },
  //     {
  //       label: "Quit",
  //       accelerator: process.platform == "darwin" ? "Command+Q" : "Ctrl+Q",
  //       click() {
  //         app.quit();
  //       },
  //     },
  //   ],
  // },
];

// If mac, add an empty menu for 'Electron'
if (process.platform === "darwin") {
  mainMenuTemplate.unshift({});
}

// add dev tool if not in production
if (process.env.NODE_ENV !== "production") {
  mainMenuTemplate.push({
    label: "Dev Tools",
    submenu: [
      {
        label: "Toggle DevTools",
        accelerator: process.platform == "darwin" ? "Command+I" : "Ctrl+I",
        click(item, focusedWindow) {
          focusedWindow.toggleDevTools();
        },
      },
      { role: "reload" },
    ],
  });
}
