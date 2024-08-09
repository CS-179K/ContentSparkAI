// // // src/components/HandleGitHubCallback.js
// // import React, { useEffect } from 'react';
// // import { useNavigate, useLocation } from 'react-router-dom';
// // import { useAuth } from './Context/AuthContext';


// // const HandleGitHubCallback = () => {
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const { login, logout } = useAuth();

// //   useEffect(() => {
// //     const urlParams = new URLSearchParams(location.search);
// //     const code = urlParams.get('code');
// //     if (code) {
// //       handleGitHubCallback(code, login, logout, navigate);
// //     } else {
// //       // No code found in URL
// //       navigate('http://localhost:3000');  // Redirect to login page or show error
// //     }
// //   }, [location, navigate, login, logout]);

// //   return <div>Processing GitHub login...</div>;
// // };

// // export default HandleGitHubCallback;
// import React, { useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import { useAuth } from './Context/AuthContext'; // Ensure this import path is correct
// import axios from 'axios'; // Make sure axios is imported if you are making HTTP requests

// const HandleGitHubCallback = () => {
//     const navigate = useNavigate();
//     const location = useLocation();
//     const { login, logout } = useAuth();

//     const handleGitHubCallback = async (code) => {
//         try {
//             const response = await axios.post('http://localhost:3000/home', {
//                 code: code,
//             });
//             const token = response.data.token;
//             login(token);
//             navigate('/home');
//         } catch (error) {
//             console.error('GitHub Login Failed', error);
//             logout();
//             navigate('/');  // Redirect to login page or show error
//         }
//     };

//     useEffect(() => {
//         const urlParams = new URLSearchParams(location.search);
//         const code = urlParams.get('code');
//         if (code) {
//             handleGitHubCallback(code);
//         } else {
//             navigate('http://localhost:3000');  // Redirect to login page or show error
//         }
//     }, [location, navigate, login, logout]);

//     return <div>Processing GitHub login...</div>;
// };

// export default HandleGitHubCallback;
