import axios from "axios";
export const fetchchats = () => {
    return axios.get("http://localhost:5000/api/chats/fetchchats",
        {
            withCredentials: true
        }
    );
}
export const searchuser = (text) => {
    return axios.get(`http://localhost:5000/api/basic/finduser?searchedUser=${text}`,
        {
            withCredentials: true
        }
    );
}
export const accessChat = (targetUserId) => {
    return axios.post("http://localhost:5000/api/chats/accesschat",
        {
            targetUserId,
        },
        {
            withCredentials: true
        }
    );
}
export const fetchmessages = (chatId) => {
    return axios.get(`http://localhost:5000/api/messages/fetchmessages/${chatId}`,
        {
            withCredentials: true
        }
    );
}
export const sendmessage = (data) => {
    return axios.post(`http://localhost:5000/api/messages/sendmessage`,
        data,
        {
            withCredentials: true
        }
    );
}
export const getuserdetails = (targetuserId) => {
    return axios.post(`http://localhost:5000/api/basic/userdetails`,
        {
            targetuserId
        },
        {
            withCredentials: true
        }
    );
}

export const markAsRead = (targetUserId) => {
    return axios.put(`http://localhost:5000/api/messages/mark-read`,
        {
            targetUserId
        },
        {
            withCredentials: true
        }
    );
}
export const updateprofile = (fullName, bio, profilePic) => {
    return axios.put(`http://localhost:5000/api/basic/updateprofile`,
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