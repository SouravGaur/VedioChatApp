import React, { createContext, useContext, useMemo } from "react";
import { io } from "socket.io-client";
const socket = io(import.meta.env.VITE_BACKEND_URL);

const SocketContext = createContext(null);

export const useSocket = () => {
  const socket = useContext(SocketContext);
  return socket;
};

export default function SockerProvider(props) {
  const socket = useMemo(() => io("localhost:8000"), []);
  return (
    <SocketContext.Provider value={socket}>
      {props.children}
    </SocketContext.Provider>
  );
}
