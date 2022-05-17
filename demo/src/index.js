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

  const [initState,setInitState] = useState('1')
  return <div onClick={()=>{setInitState('3')}}>host --- {initState}</div>
}
const Host2 = ()=>{
  return <div>222222</div>
}

createRoot(rootEl).render(<div onClick={()=>{console.log('parent onClick')}} onClickCapture={()=>{
  console.log('parent onClickCapture')
}}><div onClick={()=>{
  console.log('onClick')
}} onClickCapture={()=>{console.log('onClickCapture')}}>parent
 </div></div>);

// ReactDOM.createRoot(rootEl1).render(<div > createRoot</div>);
