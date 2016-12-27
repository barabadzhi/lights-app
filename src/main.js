const electron = require('electron');
const { app, BrowserWindow, Menu } = electron;

const path = require('path');
const url = require('url');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    center: true,
    width: 835,
    height: 690,
    minWidth: 700,
    minHeight: 690
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  const mainMenuTemplate = [{
    label: 'Монитор',
    submenu: [{
      label: 'Полноэкранный режим',
      role: 'togglefullscreen'
    }, {
      type: 'separator'
    }, {
      label: 'Выход',
      role: 'quit'
    }]
  }, {
    label: 'Секция',
    submenu: [{
      label: 'Камеры',
      accelerator: 'CmdOrCtrl+M',
      click: function () {
        mainWindow.webContents.send('section-clicked' , '.webcams-tab');
      }
    }, {
      label: 'Стандарты',
      accelerator: 'CmdOrCtrl+S',
      click: function () {
        mainWindow.webContents.send('section-clicked' , '.standards-tab');
      }
    }, {
      label: 'Информация',
      accelerator: 'CmdOrCtrl+I',
      click: function () {
        mainWindow.webContents.send('section-clicked' , '.info-tab');
      }
    }]
  }];

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);

  Menu.setApplicationMenu(mainMenu);

  // mainWindow.webContents.openDevTools();

  mainWindow.on('closed', function () {
    mainWindow = null;
  });
}

app.on('ready', createWindow);

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});
