// import {createBrowserRouter} from "react-router";
// import Login from "./features/auth/pages/login.jsx"
// import Register from "./features/auth/pages/register.jsx";
// import Protected from "./features/auth/components/Protected.jsx";
// import Home from "./features/interview/pages/Home.jsx";
// import Interview from "./features/interview/pages/interview.jsx";




// export const router = createBrowserRouter([
//     {
//         path: "/login",
//         element: <Login />
//     },
//     {
//         path: "/register",
//         element: <Register />
//     },
//     {
//         path:"/",
//         element:<Protected><Home /></Protected>
//     },
//     {
//         path:"/interview/:interviewId",
//         element: <Protected> <Interview /> </Protected>
//     }
// ])


// export default router;


import { createBrowserRouter, Outlet } from "react-router"; // किंवा react-router-dom
import Login from "./features/auth/pages/Login.jsx"
import Register from "./features/auth/pages/Register.jsx";
import Protected from "./features/auth/components/Protected.jsx";
import Home from "./features/interview/pages/Home.jsx";
import Interview from "./features/interview/pages/Interview.jsx";
import Navbar from "./features/auth/pages/Navbar.jsx";

// १. लेआउट घटक तयार करा जो सर्व प्रोटेक्टेड पेजेसवर नॅव्हबार दाखवेल
const RootLayout = () => {
    return (
        <>
            <Navbar />
            <main>
                <Outlet /> {/* इथे प्रोटेक्टेड पेजेस रेंडर होतील */}
            </main>
        </>
    );
};

export const router = createBrowserRouter([
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        // २. मुख्य पाथसाठी RootLayout वापरा
        path: "/",
        element: <Protected> <RootLayout /> </Protected>,
        children: [
            {
                path: "/",
                element: <Home />
            },
            {
                path: "/interview/:interviewId",
                element: <Interview />
            }
        ]
    }
]);

export default router;