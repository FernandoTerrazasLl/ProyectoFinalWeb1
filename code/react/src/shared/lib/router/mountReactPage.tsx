import { createRoot } from "react-dom/client";
import type { ComponentType } from "react";
import type { RoutePage } from "@shared/lib/router/RoutePage";

export function mountReactPage<Props extends object>(
  Page: ComponentType<Props>,
  buildProps: (params: Record<string, string>) => Props,
): RoutePage {
  return {
    mount(root, match) {
      const container = document.createElement("div");
      const reactRoot = createRoot(container);

      root.replaceChildren(container);
      reactRoot.render(<Page {...buildProps(match.params)} />);

      return () => reactRoot.unmount();
    },
  };
}
