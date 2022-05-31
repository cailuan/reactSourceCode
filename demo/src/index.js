// import React ,{useState}from "react";
// import ReactDOM from "react-dom";

import { createRoot } from "./myReact/react-dom";
import App from "./demo_0";
import { useState,useRef } from "./myReact/react";
// import {createRoot} from "./myReact/react-dom/client/ReactDOMRoot"

const rootEl = document.getElementById("root");
const rootEl1 = document.getElementById("root1");

// ReactDOM.render(<App />, rootEl);

// ReactDOM.createRoot(rootEl).render('1222');

debugger
const Host = ()=>{
  debugger
  const [initState,setInitState] = useState(1)
  const hookRef = useRef(null)
  return <div id="text"
  ref={hookRef}
  onClick={()=>{
  debugger
    setInitState(1 + initState);
    setInitState(2+initState)
    setTimeout(()=>{
      setInitState(5+initState)
    },2)
    console.log('host')}}>{initState}</div>
}
const Host2 = ()=>{
  return <div>222222</div>
}


const RefHook = ()=>{
  debugger
  const [initState,setInitState] = useState(1)
  const [hook1,setHook1] = useState('hook')
  const hookRef = useRef(null)
  const ref2 = useRef(null)
  const t = initState + "-1" + hook1
  return <div  ref={hookRef} onClick={()=> { debugger;setHook1(hook1+"1") ; ref2.current = (init)=>{ return init + 1} ;setInitState(ref2.current) }}>
    <div>
    {initState}
    </div>
    <Host2></Host2>
    <div>{hook1}</div>
    </div>
}

createRoot(rootEl).render(<RefHook/ >);

// ReactDOM.createRoot(rootEl1).render(<div > createRoot</div>);
