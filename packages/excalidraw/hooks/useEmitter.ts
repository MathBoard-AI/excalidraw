import { useEffect, useState } from "react";

import type { Emitter } from "@mathboard-ai/common";

export const useEmitter = <TEvent extends unknown>(
  emitter: Emitter<[TEvent]>,
  initialState: TEvent,
) => {
  const [event, setEvent] = useState<TEvent>(initialState);

  useEffect(() => {
    const unsubscribe = emitter.on((event) => {
      setEvent(event);
    });

    return () => {
      unsubscribe();
    };
  }, [emitter]);

  return event;
};
