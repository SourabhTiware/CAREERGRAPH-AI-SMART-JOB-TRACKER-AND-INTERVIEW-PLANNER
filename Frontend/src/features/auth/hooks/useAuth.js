import { useContext, useEffect} from "react";
import { AuthContext} from "../auth.context.jsx"
import {login, register, logout, getMe} from "../services/auth.api.js"


export const useAuth = () =>{
    const context = useContext(AuthContext)
    const {user, setUser, loading, setLoading } = context


    const handleLogin = async ({email, password}) =>{

        setLoading(true);

        try {
            const data = await login({ email, password});
            setUser(data.user);
            localStorage.setItem("user", JSON.stringify(data.user));
        } catch (err) {
            
        } finally{
            setLoading(false);
        }
        
    }


    const handleRegister = async ({username, email, password}) =>{

        setLoading(true);

        try {
            const data = await register({username, email, password});

            if (data.success && data.user) {
                setUser(data.user);
                localStorage.setItem('user', JSON.stringify(data.user));
            }
        }
         catch (error) {
            
        }
         finally{
            setLoading(false)
        }
    }


    const handleLogout = async ()=>{

        setLoading(true);

        try{
            const data = await logout();
            setUser(null);
            localStorage.removeItem("user");
        }catch(err){

        }
        finally{
            setLoading(false)
        }
    }
    
    useEffect(()=>{
        const getAndSetUser = async ()=>{

            const saveUser = localStorage.getItem("user");

            if(!saveUser){
                setLoading(false)
                return;
            }
            try {
                    const data = await getMe();
                    if(data && data.user) {
                        setUser(data.user);
                        localStorage.setItem("user", JSON.stringify(data.user));
                    }
                    else {
                        setUser(null);
                        localStorage.removeItem("user");
                    }
            } catch (error) {
                setUser(null);
                localStorage.removeItem("user")
            } finally{
                setLoading(false);
            }
        }

        getAndSetUser();
    }, [setUser, setLoading])


    return {user, loading, handleRegister, handleLogin, handleLogout}
}
