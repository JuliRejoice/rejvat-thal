import { getToken } from "@/lib/utils";
import socketIOClient from "socket.io-client";

const localdata = getToken();


const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;
// const SOCKET_URL = "https://259s7s89-5003.inc1.devtunnels.ms";

let socket = null;
if (localdata) {
  socket = socketIOClient(SOCKET_URL, {
    extraHeaders: {
      ["x-auth-token"]: localdata,
      "ngrok-skip-browser-warning": "1234",
    },
  });
}

export const connectSocket = () => {
  if (localdata) {
    socket = socketIOClient(SOCKET_URL, {
      extraHeaders: {
        ["x-auth-token"]: localdata,
        "ngrok-skip-browser-warning": "1234",
      },
    });
  }
};
export const getSocket = () => {
  return socket;
};