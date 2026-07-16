import React from "react";import{createRoot}from"react-dom/client";import"./style.css";import"./extras.css";import"./mobile.css";import App from"./App";
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`,{updateViaCache:"none"}));
createRoot(document.getElementById("root")!).render(<React.StrictMode><App/></React.StrictMode>);
