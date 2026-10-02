import { io } from 'socket.io-client';

const URL = 'http://localhost:5000';
export const socket = io(URL);

export let cachedOnlineUsers = [];

socket.on("online-users", (users) => {
    cachedOnlineUsers = users;
});