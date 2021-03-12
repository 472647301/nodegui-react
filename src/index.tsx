import React, { useRef, useState } from "react";
import { Renderer, Window } from "@nodegui/react-nodegui";
import { Text, Button, View } from "@nodegui/react-nodegui";
import { CheckBox, LineEdit } from "@nodegui/react-nodegui";
import { createDateWidget } from "./components/DateTime";
import { QWidget } from "@nodegui/nodegui";
import { html } from "./utils/html";
import * as styles from "./styles";
import * as Utils from "./utils";
import * as Log4js from "log4js";
import dayjs from "dayjs";
import http from "http";

const App = () => {
  const startRef = useRef<QWidget>(null);
  const stopRef = useRef<QWidget>(null);
  const [file, setFile] = useState<string>();
  const [script, setScript] = useState<string>();
  const [login, setLogin] = useState<string>();
  const [start, setStart] = useState<boolean>();
  const [config, setConfig] = useState<IConfig>(defaultConfig);
  const onSelectFile = () => {
    const file = Utils.selectFile();
    if (!file) {
      return;
    }
    setFile(file);
  };
  const onCheckScript = (bool: boolean, key: string) => {
    setScript(bool ? key : "");
  };
  const onCheckLogin = (bool: boolean, key: string) => {
    setLogin(bool ? key : "");
  };

  React.useEffect(() => {
    Utils.fetchConfig().then((res) => {
      if (res) setConfig(res);
    });
    Utils.emitter.on("stop-success", () => {
      setStart(false);
    });
    Utils.emitter.on("start-success", () => {
      setStart(true);
    });
    createDateWidget(startRef, Utils.startTimeChanged);
    createDateWidget(stopRef, Utils.stopTimeChanged);
  }, []);

  return (
    <Window
      maxSize={styles.size}
      minSize={styles.size}
      windowTitle={config.windowTitle}
      style={styles.window}
    >
      <View style={styles.wrapper}>
        <Text style={styles.title}>启动程序</Text>
        <View style={styles.rows}>
          {file ? <Text style={styles.rows_text}>{file}</Text> : null}
          <Button
            style={styles.rows_button}
            on={{ clicked: onSelectFile }}
            text={"选择启动程序"}
          />
        </View>
        <Text style={styles.title}>启动脚本</Text>
        <View style={styles.rows}>
          {config.scripts.map((e) => {
            return (
              <CheckBox
                text={e.name}
                key={`${e.key}script`}
                checked={e.key === script}
                on={{ clicked: (bool) => onCheckScript(bool, e.key) }}
              />
            );
          })}
        </View>
        <Text style={styles.title}>登录方式</Text>
        <View style={styles.rows}>
          {config.loginTypes.map((e) => {
            return (
              <CheckBox
                text={e.name}
                key={`${e.key}login`}
                checked={e.key === login}
                on={{ clicked: (bool) => onCheckLogin(bool, e.key) }}
              />
            );
          })}
        </View>
        <Text style={styles.title}>登录信息</Text>
        <View style={`${styles.rows}margin-bottom: 10px;`}>
          <Text>账号: </Text>
          <LineEdit
            on={{ textChanged: (val) => Utils.textChanged("username", val) }}
          />
        </View>
        <View style={`${styles.rows}margin-bottom: 10px;`}>
          <Text>密码(可选): </Text>
          <LineEdit
            on={{ textChanged: (val) => Utils.textChanged("password", val) }}
          />
        </View>
        <Text style={styles.title}>农场种子(可多选)</Text>
        {config.seeds.map((e, i) => (
          <View key={`${i}view`} style={styles.rows}>
            {e.map((item) => (
              <CheckBox
                text={item.name}
                key={`${item.key}seed`}
                on={{ clicked: (bool) => Utils.checkSeed(bool, item.key) }}
              />
            ))}
          </View>
        ))}
        <Text style={styles.title}>定时启动/停止(可选)</Text>
        <View style={`${styles.rows}margin-bottom: 10px;`}>
          <Text>启动时间: </Text>
          <View ref={startRef} />
        </View>
        <View style={`${styles.rows}margin-bottom: 10px;`}>
          <Text>停止时间: </Text>
          <View ref={stopRef} />
        </View>
        <Text style={styles.title}>程序异常联系方式(可选)</Text>
        <View style={styles.rows}>
          <Text>QQ: </Text>
          <LineEdit
            on={{ textChanged: (val) => Utils.textChanged("qq", val) }}
          />
        </View>
        {start ? (
          <Button
            on={{ clicked: Utils.stopApply }}
            style={styles.stop}
            text={"停止"}
          />
        ) : (
          <Button
            on={{ clicked: Utils.startApply }}
            style={styles.start}
            text={"启动"}
          />
        )}
      </View>
    </Window>
  );
};

const defaultConfig: IConfig = {
  minSize: styles.size,
  maxSize: styles.size,
  windowTitle: "DN",
  scripts: [],
  loginTypes: [],
  seeds: [],
};

const createServer = (ip: string) => {
  const server = http.createServer((request, response) => {
    response.statusCode = 200;
    response.setHeader("content-type", "text/html");
    response.write(html(ip));
    response.end();
  });

  server.listen(8877, ip, () => {
    Utils.debug(`Server started at http://${ip}:8877`);
  });
};

const onInit = () => {
  const ip = Utils.getIP();
  const name = dayjs(Date.now()).format("YYYYMMDDHHmmss");
  Log4js.configure({
    appenders: {
      app: { type: "dateFile", filename: `logs/${name}` },
    },
    categories: {
      default: { appenders: ["app"], level: "all" },
    },
  });
  if (!ip) {
    return;
  }
  createServer(ip);
};

Renderer.render(<App />, {
  onInit: onInit,
});
