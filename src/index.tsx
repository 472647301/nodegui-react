import React, { useRef, useState } from "react";
import { Renderer, Window } from "@nodegui/react-nodegui";
import { Text, Button, View } from "@nodegui/react-nodegui";
import { CheckBox, LineEdit } from "@nodegui/react-nodegui";
import { createDateWidget } from "./components/DateTime";
import { QWidget } from "@nodegui/nodegui";
import { Logger } from "./utils/logger";
import { Op } from "./utils/op.dll";
import { html } from "./utils/html";
import * as styles from "./styles";
import * as Utils from "./utils";
import http from "http";
import os from "os";

const init = Utils.cookie.init();

const App = () => {
  const startRef = useRef<QWidget>(null);
  const stopRef = useRef<QWidget>(null);
  const [file, setFile] = useState<string>(init?.file);
  const [script, setScript] = useState<string>(init?.script);
  const [login, setLogin] = useState<string>(init?.login);
  const [start, setStart] = useState<boolean>();
  const [config, setConfig] = useState<IConfig>(defaultConfig);
  const [enabledStart, setEnabledStart] = useState<boolean>(true);
  const onSelectFile = () => {
    const file = Utils.selectFile();
    if (!file) {
      return;
    }
    setFile(file);
    Utils.cookie.set("file", file);
  };
  const onCheckScript = (bool: boolean, key: string) => {
    setScript(bool ? key : "");
    Utils.cookie.set("script", bool ? key : "");
  };
  const onCheckLogin = (bool: boolean, key: string) => {
    setLogin(bool ? key : "");
    Utils.cookie.set("login", bool ? key : "");
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
      setEnabledStart(true);
    });
    createDateWidget(startRef, Utils.startTimeChanged);
    createDateWidget(stopRef, Utils.stopTimeChanged);
  }, []);

  const startApply = () => {
    if (start) {
      Utils.stopApply();
      return;
    }
    if (Utils.startApply(script, login)) {
      setEnabledStart(false);
    }
  };

  return (
    <Window
      maxSize={styles.size}
      minSize={styles.size}
      windowTitle={config.windowTitle}
      style={styles.window}
      on={{ Close: Utils.stopApply }}
    >
      <View style={styles.wrapper}>
        <Text style={styles.title}>????????????</Text>
        <View style={styles.rows}>
          {file ? <Text style={styles.rows_text}>{file}</Text> : null}
          <Button
            style={styles.rows_button}
            on={{ clicked: onSelectFile }}
            text={"??????????????????"}
          />
        </View>
        <Text style={styles.title}>????????????</Text>
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
        <Text style={styles.title}>????????????</Text>
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
        <Text style={styles.title}>????????????</Text>
        <View style={`${styles.rows}margin-bottom: 10px;`}>
          <Text>??????: </Text>
          <LineEdit
            text={init?.username}
            on={{ textChanged: (val) => Utils.textChanged("username", val) }}
          />
          <Text style="margin-left: 10px;">??????(??????): </Text>
          <LineEdit
            text={init?.password}
            on={{ textChanged: (val) => Utils.textChanged("password", val) }}
          />
        </View>
        <Text style={styles.title}>????????????(??????????????????)</Text>
        {config.seeds.map((e, i) => (
          <View key={`${i}view`} style={styles.rows}>
            {e.map((item) => (
              <CheckBox
                text={item.name}
                key={`${item.key}seed`}
                on={{ clicked: () => Utils.checkSeed(item.key) }}
              />
            ))}
          </View>
        ))}
        <Text style={styles.title}>????????????/??????(??????)</Text>
        <View style={`${styles.rows}margin-bottom: 10px;`}>
          <Text>????????????: </Text>
          <View ref={startRef} />
          <Text style="margin-left: 10px;">????????????: </Text>
          <View ref={stopRef} />
        </View>
        <Text style={styles.title}>????????????????????????(??????)</Text>
        <View style={styles.rows}>
          <Text>QQ: </Text>
          <LineEdit
            text={init?.qq}
            on={{ textChanged: (val) => Utils.textChanged("qq", val) }}
          />
          <Text style="margin-left: 10px;">
            ????????????: {`http://${Utils.getIP()}:8877`}
          </Text>
        </View>
        <Button
          on={{ clicked: startApply }}
          style={start ? styles.stop : styles.start}
          enabled={enabledStart}
          text={start ? "??????" : enabledStart ? "??????" : "???????????????..."}
        />
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
    Logger.debug(`Server started at http://${ip}:8877`);
  });
};

const onInit = () => {
  if (os.platform() !== "darwin") {
    Op.init();
  }
  Logger.init();
  const ip = Utils.getIP();
  if (!ip) {
    return;
  }
  createServer(ip);
};

Renderer.render(<App />, {
  onInit: onInit,
});
