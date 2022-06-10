import {BrowserWindow, Tray, Menu, shell} from 'electron';
import * as path from "path";

type Dimension = {
    width: number;
    height: number;
}

export default class Main {
    application: Electron.App;
    mainWindow: Electron.BrowserWindow;
    tray: Tray;
    title: string;
    baseUrl: string;
    iconPath: string;
    windowSize: Dimension;
    quitting: boolean = false;

    constructor(application: Electron.App,
                title: string,
                url: string,
                icon: string = 'icons/icon.png',
                windowSize: Dimension = {width: 1300, height: 900}) {
        this.application = application;
        this.title = title;
        this.baseUrl = url;
        this.iconPath = path.join(application.getAppPath(), icon);
        this.windowSize = windowSize;
    }

    launch(): void {
        if (this.application.requestSingleInstanceLock()) {
            this.addEventHandlers();
        } else {
            this.application.quit();
        }
    }

    private addEventHandlers() {
        this.application.on('second-instance', () => this.onSecondInstance())
        this.application.on('window-all-closed', () => this.onWindowAllClosed());
        this.application.on('ready', () => this.onReady());
    }

    private onReady(): void {
        console.log(JSON.stringify(this))
        this.mainWindow = new BrowserWindow({
            title: this.title,
            width: this.windowSize.width,
            height: this.windowSize.height,
            icon: this.iconPath,
            autoHideMenuBar: true
        });

        this.mainWindow.loadURL(this.baseUrl)
            .then(() => {
            });

        this.mainWindow.webContents.setWindowOpenHandler(({url}) => {
            shell.openExternal(url)
                .then(() => {
                })
            return {action: 'deny'}
        });

        this.mainWindow.on('close', event => this.onClose(event));

        this.tray = new Tray(this.iconPath);

        this.tray.setContextMenu(Menu.buildFromTemplate([
            {
                label: 'Show App',
                click: () => this.trayShow()
            },
            {
                label: 'Quit',
                click: () => this.quit()
            }
        ]));
    }

    private trayShow(): void {
        this.mainWindow.show();
    }

    private onSecondInstance(): void {
        if (this.mainWindow && this.mainWindow.isMinimized()) {
            this.mainWindow.restore();
            this.mainWindow.focus();
        }
    }

    private onClose(event): void {
        if (!this.quitting) {
            event.preventDefault();
            event.returnValue = false;
            this.mainWindow.hide();
        } else {
            this.mainWindow = null;
        }
    }

    private onWindowAllClosed(): void {
        if (!this.quitting) {
            this.mainWindow.hide();
        } else {
            this.application.quit();
        }
    }

    private quit(): void {
        this.quitting = true;
        this.application.quit();
    }
}
