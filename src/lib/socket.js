import { io } from 'socket.io-client';

const URL = 'https://chatbackend-5lt8.onrender.com';
export const socket = io(URL);

export let cachedOnlineUsers = [];

socket.on("online-users", (users) => {
    cachedOnlineUsers = users;
});