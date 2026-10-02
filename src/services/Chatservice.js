import axios from "axios";
export const fetchchats = () => {
    return axios.get("https://chatbackend-5lt8.onrender.com/api/chats/fetchchats",
        {
            withCredentials: true
        }
    );
}
export const searchuser = (text) => {
    return axios.get(`https://chatbackend-5lt8.onrender.com/api/basic/finduser?searchedUser=${text}`,
        {
            withCredentials: true
        }
    );
}
export const accessChat = (targetUserId) => {
    return axios.post("https://chatbackend-5lt8.onrender.com/api/chats/accesschat",
        {
            targetUserId,
        },
        {
            withCredentials: true
        }
    );
}
export const fetchmessages = (chatId) => {
    return axios.get(`https://chatbackend-5lt8.onrender.com/api/messages/fetchmessages/${chatId}`,
        {
            withCredentials: true
        }
    );
}
export const sendmessage = (data) => {
    return axios.post(`https://chatbackend-5lt8.onrender.com/api/messages/sendmessage`,
        data,
        {
            withCredentials: true
        }
    );
}
export const getuserdetails = (targetuserId) => {
    return axios.post(`https://chatbackend-5lt8.onrender.com/api/basic/userdetails`,
        {
            targetuserId
        },
        {
            withCredentials: true
        }
    );
}

export const markAsRead = (targetUserId) => {
    return axios.put(`https://chatbackend-5lt8.onrender.com/api/messages/mark-read`,
        {
            targetUserId
        },
        {
            withCredentials: true
        }
    );
}
export const updateprofile = (fullName, bio, profilePic) => {
    return axios.put(`https://chatbackend-5lt8.onrender.com/api/basic/updateprofile`,
        {
            fullName,
            bio,
            profilepic: profilePic
        },
        {
            withCredentials: true
        }
    );
}