import {
  QFileDialog,
  QMessageBox,
  QPushButton,
  ButtonRole,
} from "@nodegui/nodegui";
import { EventEmitter } from "events";
import { decode } from "js-base64";
import * as path from "path";
import axios from "axios";

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
  console.log("-----", name, value);
};

export const checkSeed = (bool: boolean, key: string) => {
  console.log("-----", bool, key);
};

export const stopApply = () => {
  emitter.emit("stop-success");
};

export const startApply = () => {
  emitter.emit("start-success");
};

/**
 *
 * @param text Format("yyyy-MM-dd hh:mm")
 */
export const startTimeChanged = (text: string) => {};

export const stopTimeChanged = (text: string) => {};

export type TextName = "username" | "password" | "qq";
