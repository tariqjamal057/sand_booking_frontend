const { app, BrowserWindow } = require("electron");
const { spawn, exec } = require("child_process");
const path = require("path");
const isDev = require("electron-is-dev");


let djangoServer = null;
let reactServer = null;

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: true,
      contextIsolation: false,
      icon: path.join(__dirname, "assets", "logo.png"),
    },
  });

  // Load React dev server in dev, else load built files
  if (isDev) {
    mainWindow.loadURL("http://localhost:5173");
  } else {
    mainWindow.loadFile(path.join(__dirname, "builder/index.html"));
  }

  // open dev tools
  // mainWindow.webContents.openDevTools();

  return mainWindow;
}

function startReactServer() {
  console.log("Starting React dev server...");
  reactServer = spawn("npm", ["run", "dev"], {
    cwd: "E:\\Client Projects\\sand_booking\\frontend",
    shell: true,
    stdio: "inherit",
  });

  reactServer.on("error", (error) => {
    console.error("Failed to start React server:", error);
  });

  reactServer.on("exit", (code, signal) => {
    console.log(`React server exited with code ${code} and signal ${signal}`);
  });

  return new Promise((resolve) => setTimeout(resolve, 5000));
}

function startDjangoServer() {
  const backendPath = "E:\\Client Projects\\sand_booking\\backend";
  console.log("Starting Django server inside venv...");

  // Directly use python inside venv
  const pythonPath = `${backendPath}\\venv\\Scripts\\python.exe`;

  djangoServer = spawn(
    `"${pythonPath}"`,
    ["manage.py", "runserver", "127.0.0.1:8000"],
    {
      cwd: backendPath,
      shell: true,
      stdio: "inherit",
    }
  );

  djangoServer.on("error", (error) => {
    console.error("Failed to start Django server:", error);
  });

  djangoServer.on("exit", (code, signal) => {
    console.log(`Django server exited with code ${code} and signal ${signal}`);
  });

  return new Promise((resolve) => setTimeout(resolve, 3000));
}

function stopServers() {
  if (djangoServer) {
    console.log("Stopping Django server...");
    djangoServer.kill("SIGTERM");
    djangoServer = null;
  }
  if (reactServer) {
    console.log("Stopping React server...");
    reactServer.kill("SIGTERM");
    reactServer = null;
  }
}

app.whenReady().then(async () => {
  try {
    await startDjangoServer();
    await startReactServer();

    const mainWindow = createWindow();

    mainWindow.on("closed", () => stopServers());

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
  } catch (error) {
    console.error("Error during startup:", error);
    stopServers();
    app.quit();
  }
});

app.on("window-all-closed", () => {
  stopServers();
  if (process.platform !== "darwin") app.quit();
});
