import React, { useState } from "react";
import { Image } from "@nodegui/react-nodegui";
import { AspectRatioMode } from "@nodegui/nodegui";
import l1 from "../images/l1.jpeg";
import l2 from "../images/l2.jpeg";
import l3 from "../images/l3.jpeg";
import l4 from "../images/l4.jpeg";
import l5 from "../images/l5.jpeg";
import l6 from "../images/l6.jpeg";
import l7 from "../images/l7.jpeg";
import l8 from "../images/l8.jpeg";

export const icons = [l1, l2, l3, l4, l5, l6, l7, l8];

type IconProps = {
  index: number;
};
export const Icon = (props: IconProps) => {
  const i = props.index - 1;
  return (
    <Image src={icons[i]} aspectRatioMode={AspectRatioMode.KeepAspectRatio} />
  );
};

export const Loading = () => {
  const [index, setIndex] = useState(1);
  let timer: NodeJS.Timeout | null = null;
  const interval = () => {
    const now = index + 1;
    if (now > 8) {
      setIndex(1);
    } else {
      setIndex(now);
    }
  };
  React.useEffect(() => {
    timer = setInterval(interval, 300);
    return () => {
      timer && clearInterval(timer);
      timer = null;
    };
  }, [index]);
  return <Icon index={index} />;
};
