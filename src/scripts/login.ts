import shell from "shelljs";
import { execFile } from "child_process";
import { cookie, emitter, showMessage } from "../utils";
import { getKeyCode } from "../utils/keyboard";
import { Op } from "../utils/op.dll";
import path from "path";
import fs from "fs";
import { Logger } from "../utils/logger";

const captureDir = path.resolve(__dirname, "../capture");
type Timeout = {
  [key: string]: NodeJS.Timeout | null;
};
type WindowInfo = {
  hwnd?: number;
  /**
   * [width,height]
   */
  size?: Array<number>;
};
export class Login {
  public static exeDir = "";
  public static exeName = "";
  public static scriptKey = "";
  public static loginKey = "";
  public static username = "";
  public static password = "";
  public static seedKeys: Array<string> = [];
  public static startTime = 0;
  public static stopTime = 0;
  public static qq = "";
  public static timeout: Timeout = {};
  /**
   * 是否已启动
   */
  public static isLauncher = false;
  public static windowInfo: WindowInfo = {};

  public static init() {
    if (!this.exeDir || !this.exeName) {
      showMessage("请选择启动程序");
      return;
    }
    if (!this.scriptKey) {
      showMessage("请选择启动脚本");
      return;
    }
    if (!this.loginKey) {
      showMessage("请选择登录方式");
      return;
    }
    if (this.loginKey !== "1" && !this.username) {
      showMessage("请输入账号");
      return;
    }
    if (this.loginKey === "3" && !this.password) {
      showMessage("请输入密码");
      return;
    }
    if (this.startTime && this.startTime < Date.now()) {
      showMessage("启动时间不能小于当前时间");
      return;
    }
    if (this.stopTime && this.stopTime < Date.now()) {
      showMessage("停止时间不能小于当前时间");
      return;
    }
    if (this.stopTime && this.stopTime < this.startTime) {
      showMessage("停止时间不能小于启动时间");
      return;
    }
    if (!fs.existsSync(captureDir)) {
      fs.mkdirSync(captureDir);
    }
    cookie.writeFile();
    if (!this.startTime) {
      this.start();
    } else {
      this.timeout["start"] = setTimeout(
        () => this.start(),
        this.startTime - Date.now()
      );
    }
    if (this.stopTime) {
      this.timeout["stop"] = setTimeout(
        () => this.stop(),
        this.stopTime - Date.now()
      );
    }
    return true;
  }

  public static start() {
    if (this.timeout["start"]) {
      clearTimeout(this.timeout["start"]);
      delete this.timeout["start"];
    }
    Logger.debug("开始运行启动程序");
    try {
      shell.cd(this.exeDir);
      // 启动应用
      const exe = execFile(`./${this.exeName}`);
      exe.on("close", () => {
        if (!this.isLauncher) {
          return;
        }
        this.bindWindow();
      });
      this.findLauncherWindow();
    } catch (e) {
      Logger.debug("运行启动程序失败");
      showMessage(JSON.stringify(e));
    }
  }

  public static stop() {
    if (this.timeout["stop"]) {
      clearTimeout(this.timeout["stop"]);
      delete this.timeout["stop"];
    }
    if (this.windowInfo.hwnd) {
      Op.unBindWindow();
    }
    emitter.emit("stop-success");
  }

  /**
   * 绑定窗口
   */
  public static bindWindow() {
    this.timeout["bindWindow"] = setInterval(() => {
      Logger.debug("正在查找主程序窗口...");
      if (!this.timeout["bindWindow"]) {
        return;
      }
      const hwnd = Op.findWindowByProcess("DragonNest.exe");
      if (!hwnd) {
        return;
      }
      const title = Op.getWindowTitle(hwnd);
      if (!title) {
        return;
      }
      if (title === "龙之谷 x86") {
        Op.bindWindow(hwnd, "normal", "normal", "normal", 0);
        Logger.debug("查找主程序窗口成功");
        const size = Op.getClientSize(hwnd);
        this.windowInfo.hwnd = hwnd;
        this.windowInfo.size = size;
        clearInterval(this.timeout["bindWindow"]);
        delete this.timeout["bindWindow"];
        this.findLoginWrap();
      }
    }, 1000);
  }

  /**
   * 查找登录框
   */
  public static findLoginWrap() {
    if (!this.windowInfo.size) {
      return;
    }
    const { size } = this.windowInfo;
    const x1 = parseInt((size[0] / 2).toFixed());
    const y1 = parseInt((size[1] / 3).toFixed());
    const pic = path.resolve(__dirname, "../images/login.png");
    this.timeout["loginWrap"] = setInterval(() => {
      Logger.debug("正在查找登录界面...");
      if (!this.timeout["loginWrap"]) {
        return;
      }
      Op.keyPress(27); // ESC
      const login = Op.findPic(x1, y1, size[0], size[1], pic, "000000", 1, 2);
      if (login.length !== 3) {
        return;
      }
      clearInterval(this.timeout["loginWrap"]);
      delete this.timeout["loginWrap"];
      Logger.debug("查找登录界面成功");
      this.submitLogin(login[0], login[1]);
    }, 3000);
  }

  /**
   * 提交登录
   */
  public static async submitLogin(xPosition: number, yPosition: number) {
    // 按钮算80*30一个
    let x = 0;
    let y = yPosition + 35;
    if (this.loginKey === "1") {
      // 扫码
      x = xPosition + 80;
    }
    if (this.loginKey === "2") {
      x = xPosition;
    } else {
      x = xPosition - 80;
    }
    Op.moveTo(x, y);
    await this.delay();
    Op.leftClick();
    if (this.loginKey === "1") {
      Logger.debug("当前登录方式为(扫码)");
      this.findServerList();
      return;
    }
    if (this.loginKey === "2") {
      Logger.debug("当前登录方式为(一键)");
    } else {
      Logger.debug("当前登录方式为(账号密码)");
    }
    await this.delay();
    Op.moveTo(xPosition, y + 55);
    await this.delay();
    Op.leftClick();
    Op.keyPress(16); // 切换英文输入法
    const keys = this.username.split("");
    Logger.debug("正在输入账号:" + this.username);
    for (let i = 0; i < keys.length; i++) {
      const arr = getKeyCode(keys[i]);
      arr.forEach((code) => {
        Op.keyPress(code);
      });
    }
    if (this.loginKey === "3") {
      Op.moveTo(xPosition, y + 110);
      await this.delay();
      Op.leftClick();
      const pws = this.password.split("");
      Logger.debug("正在输入密码:" + this.password);
      for (let i = 0; i < pws.length; i++) {
        const arr = getKeyCode(pws[i]);
        arr.forEach((code) => {
          Op.keyPress(code);
        });
      }
    }
    if (!this.windowInfo.size) {
      return;
    }
    const { size } = this.windowInfo;
    const x1 = parseInt((size[0] / 2).toFixed());
    const y1 = parseInt((size[1] / 3).toFixed());
    const pic = path.resolve(__dirname, "../images/submit.png");
    this.timeout["submitLogin"] = setInterval(async () => {
      Logger.debug("正在查找登录按钮...");
      if (!this.timeout["submitLogin"]) {
        return;
      }
      const submit = Op.findPic(x1, y1, size[0], size[1], pic, "000000", 1, 2);
      if (submit.length !== 3) {
        return;
      }
      clearInterval(this.timeout["submitLogin"]);
      delete this.timeout["submitLogin"];
      Op.moveTo(submit[0] + 20, submit[1] + 30);
      await this.delay();
      Op.leftClick();
      Logger.debug("查找登录按钮成功");
      this.findServerList();
    });
  }

  public static findServerList() {
    if (!this.windowInfo.size) {
      return;
    }
    const { size } = this.windowInfo;
    const x1 = parseInt((size[0] / 2).toFixed());
    const y1 = parseInt((size[1] / 2).toFixed());
    const pic = path.resolve(__dirname, "../images/server.png");
    this.timeout["serverList"] = setInterval(async () => {
      Logger.debug("正在查找登录结果...");
      if (!this.timeout["serverList"]) {
        return;
      }
      const submit = Op.findPic(x1, y1, size[0], size[1], pic, "000000", 1, 2);
      if (submit.length !== 3) {
        return;
      }
      clearInterval(this.timeout["serverList"]);
      delete this.timeout["serverList"];
      Op.keyDown(13); // Enter
      Logger.debug("查找登录结果成功");
      this.findGameRole();
    });
  }

  public static findGameRole() {
    Logger.debug("正在查找游戏角色...");
  }

  /**
   * 查找启动窗口
   */
  public static findLauncherWindow() {
    this.timeout["launcher"] = setInterval(() => {
      Logger.debug("正在查找启动窗口...");
      if (!this.timeout["launcher"]) {
        return;
      }
      const hwnd = Op.findWindowByProcess(this.exeName);
      if (!hwnd) {
        return;
      }
      const title = Op.getWindowTitle(hwnd);
      if (!title) {
        return;
      }
      if (title === "iDNLauncher") {
        emitter.emit("start-success");
        Logger.debug("查找启动窗口成功");
        clearInterval(this.timeout["launcher"]);
        delete this.timeout["launcher"];
        this.clickLauncherGame(hwnd);
      }
    }, 1000);
  }

  /**
   * 点击启动游戏
   */
  public static clickLauncherGame(hwnd: number) {
    const size = Op.getClientRect(hwnd);
    if (size.length !== 4) {
      return;
    }
    const x1 = size[0];
    const y1 = size[1];
    const x2 = size[2];
    const y2 = size[3];
    const pic = path.resolve(__dirname, "../images/launcher.png");
    this.timeout["launcherGame"] = setInterval(async () => {
      Logger.debug("正在查找开始游戏按钮...");
      if (!this.timeout["launcherGame"]) {
        return;
      }
      const launcher = Op.findPic(x1, y1, x2, y2, pic, "000000", 1, 3);
      if (launcher.length !== 3) {
        return;
      }
      const x = launcher[0] + 10;
      const y = launcher[1] + 5;
      Op.moveTo(x, y);
      Logger.debug("查找开始游戏按钮成功");
      await this.delay();
      Op.leftClick();
      this.isLauncher = true;
      Logger.debug("已点击开始游戏按钮");
      clearInterval(this.timeout["launcherGame"]);
      delete this.timeout["launcherGame"];
    }, 1000);
  }

  public static delay(n: number = 300) {
    return new Promise((resolve) => {
      setTimeout(resolve, n);
    });
  }
}
