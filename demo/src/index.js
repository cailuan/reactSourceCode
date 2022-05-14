// import React ,{useState}from "react";
// import ReactDOM from "react-dom";

import { createRoot } from "./myReact/react-dom";
import App from "./demo_0";
import { useState } from "./myReact/react";
// import {createRoot} from "./myReact/react-dom/client/ReactDOMRoot"

const rootEl = document.getElementById("root");
const rootEl1 = document.getElementById("root1");

// ReactDOM.render(<App />, rootEl);

// ReactDOM.createRoot(rootEl).render('1222');

debugger
const Host = ()=>{
  debugger
  const init = useState('1')
  return <div>host</div>
}
const Host2 = ()=>{
  return <div>222222</div>
}

createRoot(rootEl).render(<div><Host></Host></div>);

// ReactDOM.createRoot(rootEl1).render(<div > createRoot</div>);
