import { memo, useState } from "react";
import { colorFromString } from "../lib/color";

interface Props {
  image: string;
  symbol: string;
  size?: number;
}

function CoinIconBase({ image, symbol, size = 24 }: Props) {
  const [failed, setFailed] = useState(false);
  const showMonogram = !image || failed;

  if (showMonogram) {
    return (
      <span
        className="coin-monogram"
        style={{ width: size, height: size, background: colorFromString(symbol) }}
        aria-hidden
      >
        {symbol.slice(0, 2).toUpperCase()}
      </span>
    );
  }
  return (
    <img
      src={image}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className="coin-img"
      onError={() => setFailed(true)}
    />
  );
}

export const CoinIcon = memo(CoinIconBase);
