import axios from "axios";


const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true
    // axios restrict to server set to cookies to be sent in cross-origin requests, this is required for session management with cookies. 
})


export const register = async({username, email, password}) => {
    try {
        const response = await API.post(`/api/auth/register`, {
            username, email, password
        })

        return response.data;
    } catch(err){
        console.log(err)
    }
}

export const login = async({email, password}) =>{
    try {
        const response = await API.post(`/api/auth/login`, {
            email, password
        })

        return response.data;

    } catch (err) {
        console.log(err)
    }
}

export const logout = async() =>{
    try {
        const response = await API.get(`/api/auth/logout`)

    return response.data;

    } catch (err) {
        console.log(err);
    }
}

export const getMe = async () =>{
    try {
        const response = await API.get(`/api/auth/get-me`)

        return response.data;

    } catch (err) {
        console.log(err)
        if (err.response?.status !== 401) {
            console.error("Fetch User Error:", err);
        }
        return null; // Explicitly return null so 'data' isn't undefined
    }

}