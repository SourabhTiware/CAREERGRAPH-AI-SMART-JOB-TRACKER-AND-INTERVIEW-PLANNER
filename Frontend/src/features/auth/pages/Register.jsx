import React, { useState } from "react";
import {useNavigate, Link} from "react-router"
import { useAuth} from "../hooks/useAuth.js"
import { MainHeading } from "./MainHeading.jsx";

const Register = () => {

  const navigate = useNavigate();
  const [ username, setUsername ] = useState("");
  const [ email, setEmail ] = useState("");
  const [ password, setPassword ] = useState("");


  const {loading, handleRegister, authError} = useAuth();

    const handleSubmit = async (e) => {
      e.preventDefault();
      const result = await handleRegister({username, email, password});
      if(result && result.success){
        navigate("/");
      }
      
    }

    if(loading){
      return (<main><h1>Loading.......</h1></main>)
    }

  return (
    <div>
      
        <main>
          <MainHeading />

        <div className="form-container">
            <h1 >Register</h1>

            {authError && <div className="error-alert">{authError}</div>}

            <form onSubmit={handleSubmit}>
                <div className="input-group">
                    <label htmlFor="username">Username</label>
                    <input 
                      onChange={(e) =>{ setUsername (e.target.value ) }}
                      type="text" id="username" name="username" placeholder="Enter username" required />
                </div>

                <div className="input-group">
                    <label htmlFor="email">Email</label>
                    <input 
                      onChange={(e) =>{ setEmail (e.target.value ) }}
                      type="email" id="email" name="email" placeholder="Enter email address" required />
                </div>

                <div className="input-group">
                    <label htmlFor="password">Password</label>
                    <input 
                      onChange={(e) =>{setPassword (e.target.value ) }}
                      type="password" id="password" name="password" placeholder="Enter password" required />
                </div>

                <button className="button primary-button">Register</button>
            </form>

            <p className="redirect-link">Already have an account? <Link to="/login">Login here</Link></p>
        </div>
    </main>
    </div>
    );
};

export default Register;