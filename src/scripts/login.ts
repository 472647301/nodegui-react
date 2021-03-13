import shell from "shelljs";
import { execFile } from "child_process";
import { emitter, showMessage } from "../utils";
import { Op } from "../utils/op.dll";
import path from "path";
import fs from "fs";

const captureDir = path.resolve(__dirname, "../capture");

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
  public static startTimeout: NodeJS.Timeout | null = null;
  public static stopTimeout: NodeJS.Timeout | null = null;
  public static findProcessTimer: NodeJS.Timeout | null = null;
  public static findPicTimer: NodeJS.Timeout | null = null;
  public static findTitleTimer: NodeJS.Timeout | null = null;
  public static clickStart?: { x: number; y: number };

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
    if (this.loginKey !== "2" && !this.username) {
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
    if (!this.startTime) {
      this.start();
    } else {
      this.startTimeout = setTimeout(
        () => this.start(),
        this.startTime - Date.now()
      );
    }
    if (this.stopTime) {
      this.stopTimeout = setTimeout(
        () => this.stop(),
        this.stopTime - Date.now()
      );
    }
    return true;
  }

  public static start() {
    try {
      shell.cd(this.exeDir);
      const exe = execFile(`./${this.exeName}`);
      exe.on("close", (code) => {
        if (!this.clickStart) {
          return;
        }
        this.enterUsername();
      });
      this.findWindowByProcess();
    } catch (e) {
      console.log(e);
      showMessage(JSON.stringify(e));
    }
  }

  public static stop() {
    emitter.emit("stop-success");
  }

  public static enterUsername() {
    this.findTitleTimer = setInterval(() => {
      if (!this.findTitleTimer) {
        return;
      }
      const hwnd = Op.findWindowEx();
      console.log("---findWindow-----", hwnd);
    }, 1000);
  }

  public static findWindowByProcess() {
    this.findProcessTimer = setInterval(() => {
      if (!this.findProcessTimer) {
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
        clearInterval(this.findProcessTimer);
        this.findProcessTimer = null;
        this.clickStartGame(hwnd);
      }
    }, 1000);
  }

  public static clickStartGame(hwnd: number) {
    const size = Op.getClientRect(hwnd);
    if (size.length !== 4) {
      return;
    }
    this.findPicTimer = setInterval(() => {
      if (!this.findPicTimer) {
        return;
      }
      const xy = Op.findPic(
        size[0],
        size[1],
        size[2],
        size[3],
        `${path.resolve(__dirname, "../images/startgame.png")}`,
        "000000",
        1,
        3
      );
      if (xy.length !== 3) {
        return;
      }
      clearInterval(this.findPicTimer);
      this.findPicTimer = null;
      this.clickStart = { x: xy[0], y: xy[1] };
      Op.moveTo(xy[0], xy[1]);
      Op.leftClick();
    }, 1000);
  }
}
