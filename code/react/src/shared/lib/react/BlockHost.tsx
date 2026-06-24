import { useEffect, useRef } from "react";
import type { Block } from "@shared/lib/block/Block";

type BlockHostProps = {
  createBlock: () => Block;
};

export function BlockHost({ createBlock }: BlockHostProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;

    if (!container)
      return;

    const element = createBlock().element();

    if (element)
      container.replaceChildren(element);

    return () => container.replaceChildren();
  }, [createBlock]);

  return <div ref={containerRef} />;
}
