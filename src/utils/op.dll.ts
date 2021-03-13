import path from "path";
import { execSync } from "child_process";
import { showMessage } from ".";

const winax = require("winax");

export type DisplayType = "normal" | "gdi" | "gdi2" | "dx" | "dx2" | "dx3";
export type MouseType =
  | "normal"
  | "windows"
  | "windows2"
  | "windows3"
  | "dx"
  | "dx2";
export type KeypadType = "normal" | "windows" | "dx";
type OpCOM = any;

export class Op {
  public static op: OpCOM;
  public static mouseRange: Array<number> = [];

  public static init(): void {
    try {
      this.op = new winax.Object("op.opsoft");
    } catch (e) {
      try {
        const dll = path.resolve(__dirname, `../op_x64.dll`);
        execSync(`regsvr32 ${dll} /s`);
        this.op = new winax.Object("op.opsoft");
      } catch (err) {
        showMessage(JSON.stringify(err));
      }
    }
  }

  /**
   * getCursorPos
   * @returns [x, y]
   */
  public static getCursorPos(): Array<number> {
    let x = new winax.Variant(-1, "byref");
    let y = new winax.Variant(-1, "byref");
    this.op.GetCursorPos(x, y);
    return [Number(x), Number(y)];
  }

  /**
   * getKeyState
   * @param keyCode
   * @returns 0-Up 1-Down
   */
  public static getKeyState(keyCode: number): number {
    return this.op.GetKeyState(keyCode);
  }

  /**
   * setMouseRange
   * @param mouseRange [x1: number, y1: number, x2: number, y2: number]
   * @returns void
   */
  public static setMouseRange(mouseRange: Array<number>): void {
    if (mouseRange.length !== 4) {
      return;
    }
    this.mouseRange = mouseRange;
  }

  /**
   * moveTo
   * @param x number
   * @param y number
   * @returns 0-Failed 1-Success
   */
  public static moveTo(x: number, y: number): number {
    if (!this.mouseRange.length) {
      return this.op.MoveTo(x, y);
    }
    if (x < this.mouseRange[0]) {
      x = this.mouseRange[0];
    } else if (x > this.mouseRange[2]) {
      x = this.mouseRange[2];
    }
    if (y < this.mouseRange[1]) {
      y = this.mouseRange[1];
    } else if (y > this.mouseRange[3]) {
      y = this.mouseRange[3];
    }
    return this.op.MoveTo(x, y);
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static leftClick(): number {
    return this.op.LeftClick();
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static leftDoubleClick(): number {
    return this.op.leftDoubleClick();
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static leftDown(): number {
    return this.op.leftDown();
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static leftUp(): number {
    return this.op.leftUp();
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static rightClick(): number {
    return this.op.rightClick();
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static rightDown(): number {
    return this.op.rightDown();
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static rightUp(): number {
    return this.op.rightUp();
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static wheelDown(): number {
    return this.op.wheelDown();
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static wheelUp(): number {
    return this.op.wheelUp();
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static keyPress(keyCode: number): number {
    return this.op.keyPress(keyCode);
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static keyDown(keyCode: number): number {
    return this.op.keyDown(keyCode);
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static keyUp(keyCode: number): number {
    return this.op.keyUp(keyCode);
  }

  /**
   * @returns [pid]
   */
  public static enumProcess(name: string): Array<number> {
    const pids: string = this.op.EnumProcess(name);
    return pids.length > 0 ? pids.split(",").map((pid) => Number(pid)) : [];
  }

  public static findWindowByProcess(
    name: string,
    className?: string,
    title?: string
  ): number | undefined {
    return this.op.FindWindowByProcess(name, className, title);
  }

  public static enumWindow(
    className?: string,
    title?: string,
    filter?: number,
    parentHWnd = 0
  ): Array<number> {
    const wins: string = this.op.EnumWindow(
      parentHWnd,
      title,
      className,
      filter
    );
    return wins.length > 0 ? wins.split(",").map((hWnd) => Number(hWnd)) : [];
  }

  public static findWindow(
    className?: string,
    title?: string,
    parentHWnd?: number
  ): number | undefined {
    const hWnd = parentHWnd
      ? this.enumWindow(className, title, 3, parentHWnd)[0]
      : this.op.FindWindow(className, title);
    if (hWnd) return hWnd;
  }

  public static findWindowEx(
    parent?: number,
    className?: string,
    title?: string
  ): number {
    return this.op.findWindowEx(parent, className, title);
  }

  public static getWindow(hwnd: number, flag: number): number {
    return this.op.GetWindow(hwnd, flag);
  }

  public static getWindowTitle(hwnd: number): string {
    return this.op.GetWindowTitle(hwnd);
  }

  public static getPointWindow(x: number, y: number): number {
    return this.op.GetPointWindow(x, y);
  }

  /**
   * @returns [width, height]
   */
  public static getClientSize(hwnd: number): Array<number> {
    let width = new winax.Variant(-1, "byref");
    let height = new winax.Variant(-1, "byref");
    const ret = this.op.GetClientSize(hwnd, width, height);
    return ret ? [Number(width), Number(height)] : [];
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static moveWindow(hwnd: number, x: number, y: number): number {
    return this.op.MoveWindow(hwnd, x, y);
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static setWindowSize(
    hwnd: number,
    width: number,
    height: number
  ): number {
    return this.op.SetWindowSize(hwnd, width, height);
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static setWindowState(hwnd: number, state: number): number {
    return this.op.setWindowState(hwnd, state);
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static sendPaste(hwnd: number): number {
    return this.op.sendPaste(hwnd);
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static sendString(hwnd: number, content: string): number {
    return this.op.sendString(hwnd, content);
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static bindWindow(
    hwnd: number,
    display: DisplayType,
    mouse: MouseType,
    keypad: KeypadType,
    mode: 0 | 2 | 4
  ): number {
    return this.op.bindWindow(hwnd, display, mouse, keypad, mode);
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static unBindWindow(): number {
    return this.op.UnBindWindow();
  }

  /**
   * @returns [x1, y1 ,x2, y2]
   */
  public static getClientRect(hwnd: number) {
    let x1 = new winax.Variant(-1, "byref");
    let y1 = new winax.Variant(-1, "byref");
    let x2 = new winax.Variant(-1, "byref");
    let y2 = new winax.Variant(-1, "byref");
    const rect = this.op.GetClientRect(hwnd, x1, y1, x2, y2);
    return rect ? [x1, y1, x2, y2] : [];
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static capture(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    fileName: string
  ): number {
    return this.op.capture(x1, y1, x2, y2, fileName);
  }

  /**
   * @returns [x, y, index]
   */
  public static findPic(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    picName: string,
    deltaColor: string,
    sim: number,
    dir: number
  ): Array<number> {
    let x = new winax.Variant(-1, "byref");
    let y = new winax.Variant(-1, "byref");
    const index = this.op.FindPic(
      x1,
      y1,
      x2,
      y2,
      picName,
      deltaColor,
      sim,
      dir,
      x,
      y
    );
    return index !== -1 ? [Number(x), Number(y), index] : [];
  }

  /**
   * @returns [x, y, index]
   */
  public static findPicEx(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    picName: string,
    deltaColor: string,
    sim: number,
    dir: number
  ): Array<number[]> {
    const ret = this.op.FindPicEx(
      x1,
      y1,
      x2,
      y2,
      picName,
      deltaColor,
      sim,
      dir
    );
    if (ret.length > 0) {
      return ret.split("|").map((pic: string) => {
        const [index, x, y] = pic.split(",");
        return [Number(x), Number(y), Number(index)];
      });
    }
    return [];
  }

  public static getColor(x: number, y: number): string {
    return this.op.GetColor(x, y);
  }

  public static getColorNum(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    sim: number
  ): number {
    return this.op.GetColorNum(x1, y1, x2, y2, color, sim);
  }

  public static getAveRGB(
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): string {
    return this.op.GetAveRGB(x1, y1, x2, y2);
  }

  /**
   * @returns [x, y]
   */
  public static findColor(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    color: string,
    sim: number,
    dir: number
  ): Array<number> {
    let x = new winax.Variant(-1, "byref");
    let y = new winax.Variant(-1, "byref");
    const ret = this.op.FindColor(x1, y1, x2, y2, color, sim, dir, x, y);
    return ret ? [Number(x), Number(y)] : [];
  }

  public static getNowDict(): number {
    return this.op.GetNowDict();
  }

  /**
   * @returns 0-Failed 1-Success
   */
  public static setDict(index: number, file: string): number {
    return this.op.SetDict(index, file);
  }

  /**
   * @returns [x, y, index]
   */
  public static findStr(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    str: string,
    colorFormat: string,
    sim: number
  ): Array<number> {
    let x = new winax.Variant(-1, "byref");
    let y = new winax.Variant(-1, "byref");
    const index = this.op.FindStr(x1, y1, x2, y2, str, colorFormat, sim, x, y);
    return index !== -1 ? [Number(x), Number(y), index] : [];
  }

  public static ocr(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    colorFormat: string,
    sim: number
  ): string {
    return this.op.Ocr(x1, y1, x2, y2, colorFormat, sim);
  }

  public static ocrAuto(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    sim: number
  ): string {
    return this.op.OcrAuto(x1, y1, x2, y2, sim);
  }

  /**
   * @returns [width, height]
   */
  public static getScreenSize(): Array<number> {
    const w = this.op.GetScreenWidth();
    const h = this.op.GetScreenHeight();
    return [w, h];
  }
}
