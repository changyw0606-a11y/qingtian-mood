import React from "react";import{createRoot}from"react-dom/client";import"./style.css";import"./extras.css";import App from"./App";
if("serviceWorker" in navigator)window.addEventListener("load",()=>navigator.serviceWorker.register("./sw.js"));
createRoot(document.getElementById("root")!).render(<React.StrictMode><App/></React.StrictMode>);
