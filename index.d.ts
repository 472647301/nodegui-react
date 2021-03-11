interface IConfig {
  minSize: ISize;
  maxSize: ISize;
  windowTitle: string;
  scripts: Array<ItemT>;
  loginTypes: Array<ItemT>;
  seeds: Array<ItemT[]>;
}

interface ISize {
  width: number;
  height: number;
}
interface ItemT {
  key: string;
  name: string;
}
