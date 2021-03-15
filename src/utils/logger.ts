import fs from "fs";
import dayjs from "dayjs";
import path from "path";
import { wss } from ".";

export class Logger {
  public static path = "";

  public static init() {
    const time = dayjs(Date.now()).format("YYYYMMDDHHmm");
    const dir = path.resolve(__dirname, `../logs`);
    this.path = `${dir}/${time}.log`;
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  }

  public static debug(message: string) {
    const now = dayjs(Date.now()).format("YYYY-MM-DD HH:mm:ss");
    const msg = `[${now}] ${message}`;
    const options: fs.WriteFileOptions = {
      flag: "a",
      encoding: "utf-8",
      mode: "0644",
    };
    fs.writeFile(this.path, msg, options, console.log);
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify({ type: "log", data: msg }));
      }
    });
  }
}
