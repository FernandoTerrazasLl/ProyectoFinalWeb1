import { useEffect, useRef } from "react";
import { startApp } from "@app/startApp";
import { ReactHeader } from "@widgets/header";
import { ReactToastHost } from "@widgets/toast-host";
import "@app/styles/global.css";

export function App() {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const content = contentRef.current;

    if (!content)
      return;

    const stopApp = startApp(content);

    return () => {
      stopApp();
      content.replaceChildren();
    };
  }, []);

  return (
    <>
      <ReactHeader />
      <div className="app__content" ref={contentRef} />
      <ReactToastHost />
    </>
  );
}
