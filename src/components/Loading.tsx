import React, { useState } from "react";
import { Image } from "@nodegui/react-nodegui";
import { AspectRatioMode } from "@nodegui/nodegui";
import path from "path";

const rootDir = path.resolve(__dirname, "../..");
const assetUrl = path.resolve(rootDir, "src/images");

type IconProps = {
  icon: string;
};
export const Icon = (props: IconProps) => {
  const iconId = props.icon || "l1";
  const url = path.resolve(assetUrl, `${iconId}.jpeg`);
  return <Image src={url} aspectRatioMode={AspectRatioMode.KeepAspectRatio} />;
};

export const Loading = () => {
  let timer: NodeJS.Timeout | null = null;
  const [index, setIndex] = useState(1);
  React.useEffect(() => {
    timer = setInterval(() => {
      const now = index + 1;
      if (now > 8) {
        setIndex(1);
      } else {
        setIndex(now);
      }
    }, 300);
    return () => {
      timer && clearInterval(timer);
      timer = null;
    };
  }, []);
  return <Icon icon={`l${index}`} />;
};
