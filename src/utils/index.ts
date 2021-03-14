import {
  QFileDialog,
  QMessageBox,
  QPushButton,
  ButtonRole,
} from "@nodegui/nodegui";
import { Login } from "../scripts/login";
import { EventEmitter } from "events";
import { decode } from "js-base64";
import * as path from "path";
import WebSocket from "ws";
import axios from "axios";
import dayjs from "dayjs";
import os from "os";

export const emitter = new EventEmitter();

export const selectFile = () => {
  const fileDialog = new QFileDialog();
  fileDialog.exec();
  const value = fileDialog.selectedFiles();
  if (!value.length) {
    return;
  }
  const file = value[0];
  if (path.extname(file) !== ".exe") {
    showMessage("请选择exe文件程序");
    return;
  }
  Login.exeDir = path.dirname(file);
  Login.exeName = path.basename(file);
  return path.basename(file);
};

export const showMessage = (text: string) => {
  const messageBox = new QMessageBox();
  messageBox.setText(text);
  const accept = new QPushButton();
  accept.setText("OK");
  messageBox.addButton(accept, ButtonRole.AcceptRole);
  messageBox.exec();
};

export const fetchConfig = async () => {
  try {
    const res = await axios.get<IConfig>(
      decode(
        "aHR0cHM6Ly9naXRlZS5jb20vdGhpc3podXdlbmJvL25vZGVndWktcmVhY3QvcmF3L21haW4vY29uZmlnLmpzb24="
      )
    );
    return res.data;
  } catch (err) {
    return void 0;
  }
};

export const textChanged = (name: TextName, value: string) => {
  if (name === "username") {
    Login.username = value;
  }
  if (name === "password") {
    Login.password = value;
  }
  if (name === "qq") {
    Login.qq = value;
  }
};

export const checkSeed = (key: string) => {
  const index = Login.seedKeys.indexOf(key);
  if (index !== -1) {
    Login.seedKeys.splice(index, 1);
  } else {
    Login.seedKeys.push(key);
  }
};

export const startApply = (scriptKey?: string, loginKey?: string) => {
  Login.scriptKey = scriptKey || "";
  Login.loginKey = loginKey || "";
  return Login.init();
};

export const stopApply = () => {
  console.log("--stop---");
  Login.stop();
};

/**
 *
 * @param text Format("yyyy-MM-dd hh:mm")
 */
export const startTimeChanged = (text: string) => {
  const val = dayjs(text).valueOf();
  Login.startTime = val;
};

export const stopTimeChanged = (text: string) => {
  const val = dayjs(text).valueOf();
  Login.stopTime = val;
};

export const getIP = () => {
  const interfaces = os.networkInterfaces(); //服务器本机地址
  let IPAdress = "";
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    if (!iface) {
      continue;
    }
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (
        alias.family === "IPv4" &&
        alias.address !== "127.0.0.1" &&
        !alias.internal
      ) {
        IPAdress = alias.address;
      }
    }
  }
  return IPAdress;
};

export const wss = new WebSocket.Server({ port: 8876 });

wss.on("connection", function connection(ws) {
  ws.on("message", function incoming(message) {
    console.log("received: %s", message);
  });

  ws.send("something");
});

export type TextName = "username" | "password" | "qq";
