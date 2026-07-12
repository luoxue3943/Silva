"use client";

import { useEffect, useState } from "react";

export default function MockProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [ready, setReady] = useState(process.env.NODE_ENV !== "development");

  useEffect(() => {
    if (process.env.NODE_ENV !== "development") {
      return;
    }

    async function startMock() {
      const { worker } = await import("@/mocks/browser");

      await worker.start({
        onUnhandledRequest: "bypass",
      });

      setReady(true);
    }

    void startMock();
  }, []);

  if (!ready) {
    return null;
  }

  return children;
}
