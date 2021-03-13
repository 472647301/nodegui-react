import fs from "fs";
import dayjs from "dayjs";
import path from "path";

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
    fs.writeFile(
      this.path,
      message,
      {
        flag: "a",
        encoding: "utf-8",
        mode: "0644",
      },
      console.log
    );
  }
}
