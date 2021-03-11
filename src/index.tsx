import * as React from "react";
import { Renderer, Window } from "@nodegui/react-nodegui";
import { View, Text, Button, CheckBox, LineEdit } from "@nodegui/react-nodegui";
import { QFileDialog, QMessageBox } from "@nodegui/nodegui";
import { QPushButton, ButtonRole } from "@nodegui/nodegui";
import { minSize, maxSize, windowTitle } from "./config";
import { loginTypes, seeds, scripts } from "./config";
import { EventEmitter } from "events";
import * as styles from "./styles";
import * as path from "path";

const emt = new EventEmitter();

const App = () => {
  const [filePath, setFilePath] = React.useState("");
  const [scriptType, setScriptType] = React.useState("");
  const [loginType, setLoginType] = React.useState("");
  const [isStart, setStart] = React.useState(false);
  const onSelectFile = () => {
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
    setFilePath(path.basename(file));
  };

  const onCheckScript = (bool: boolean, key: string) => {
    setScriptType(bool ? key : "");
  };
  const onCheckLoginType = (bool: boolean, key: string) => {
    setLoginType(bool ? key : "");
  };

  React.useEffect(() => {
    emt.on("stop-success", () => {
      setStart(false);
    });
    emt.on("start-success", () => {
      setStart(true);
    });
  }, []);

  return (
    <Window
      maxSize={maxSize}
      minSize={minSize}
      windowTitle={windowTitle}
      style={styles.window}
    >
      <View style={styles.wrapper}>
        <Text style={styles.title}>启动程序</Text>
        <View style={styles.rows}>
          {filePath ? <Text style={styles.rows_text}>{filePath}</Text> : null}
          <Button
            style={styles.rows_button}
            on={{ clicked: onSelectFile }}
            text={"选择启动程序"}
          />
        </View>
        <Text style={styles.title}>启动脚本</Text>
        <View style={styles.rows}>
          {scripts.map((e) => {
            return (
              <CheckBox
                text={e.name}
                key={`${e.key}script`}
                checked={e.key === scriptType}
                on={{ clicked: (bool) => onCheckScript(bool, e.key) }}
              />
            );
          })}
        </View>
        <Text style={styles.title}>登录方式</Text>
        <View style={styles.rows}>
          {loginTypes.map((e) => {
            return (
              <CheckBox
                text={e.name}
                key={`${e.key}login`}
                checked={e.key === loginType}
                on={{ clicked: (bool) => onCheckLoginType(bool, e.key) }}
              />
            );
          })}
        </View>
        <Text style={styles.title}>登录信息</Text>
        <View style={`${styles.rows}margin-bottom: 10px;`}>
          <Text>账号: </Text>
          <LineEdit
            on={{ textChanged: (val) => textChanged("username", val) }}
          />
        </View>
        <View style={`${styles.rows}margin-bottom: 10px;`}>
          <Text>密码(可选): </Text>
          <LineEdit
            on={{ textChanged: (val) => textChanged("password", val) }}
          />
        </View>
        <Text style={styles.title}>农场种子(可多选)</Text>
        {seeds.map((e, i) => (
          <View key={`${i}view`} style={styles.rows}>
            {e.map((item) => (
              <CheckBox
                text={item.name}
                key={`${item.key}seed`}
                on={{ clicked: (bool) => checkSeed(bool, item.key) }}
              />
            ))}
          </View>
        ))}
        <Text style={styles.title}>程序异常联系方式(可选)</Text>
        <View style={styles.rows}>
          <Text>QQ: </Text>
          <LineEdit on={{ textChanged: (val) => textChanged("qq", val) }} />
        </View>
        {isStart ? (
          <Button
            on={{ clicked: stopApply }}
            style={styles.stop}
            text={"停止"}
          />
        ) : (
          <Button
            on={{ clicked: startApply }}
            style={styles.start}
            text={"启动"}
          />
        )}
      </View>
    </Window>
  );
};

const showMessage = (text: string) => {
  const messageBox = new QMessageBox();
  messageBox.setText(text);
  const accept = new QPushButton();
  accept.setText("OK");
  messageBox.addButton(accept, ButtonRole.AcceptRole);
  messageBox.exec();
};

const textChanged = (name: TextName, value: string) => {
  console.log("-----", name, value);
};

const checkSeed = (bool: boolean, key: string) => {
  console.log("-----", bool, key);
};

const stopApply = () => {
  emt.emit("stop-success");
};

const startApply = () => {
  emt.emit("start-success");
};

Renderer.render(<App />);

type TextName = "username" | "password" | "qq";
