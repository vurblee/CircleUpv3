// SocketProvider.js
import React, { createContext, useEffect } from "react";
import socket, { setOffline } from "../providers/ws-client"; // Adjust path if needed

export const SocketContext = createContext(socket);

export const SocketProvider = ({ children }) => {
  useEffect(() => {
    // When the provider mounts, the socket connection is established.
    return () => {
      // Optionally, set user offline and disconnect when the provider unmounts.
      setOffline();
      socket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
