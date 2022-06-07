// import React ,{useState}from "react";
// import ReactDOM from "react-dom";

import { createRoot } from "./myReact/react-dom";
import App from "./demo_0";
import { useState,useRef,useEffect,useMemo,useCallback,useReducer,useLayoutEffect } from "./myReact/react";
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

let init = 1
const RefHook = ()=>{
  debugger
  init ++
  console.log(init)
  const [initState,setInitState] = useState(1)
  const [hook1,setHook1] = useState('hook')
  const callback = useCallback(()=>{
    console.log('callback')
  },[])
  useEffect(()=>{
    console.log('useEffect')
    // setInitState(initState + 1)
  },[])
  const myMemo = useMemo(()=>{
    return {
      hook1
    }
  },[])
  const hookRef = useRef(null)
  const ref2 = useRef(null)
  const t = initState + "-1" + hook1
  console.log(myMemo)
  callback()
  return <div id="ref"  ref={hookRef} onClick={()=> { setHook1(hook1 + '1') }}>
    {myMemo.hook1}
    </div>
}

const initialState = {count: 0};

function reducer(state, action) {
  switch (action.type) {
    case 'increment':
      return {count: state.count + 1};
    case 'decrement':
      return {count: state.count - 1};
    default:
      throw new Error();
  }
}

const CreateReducer = ()=>{
  debugger
  const [state, dispatch] = useReducer(reducer, initialState);
  useLayoutEffect(()=>{
    console.log('useLayout')
  })
  return <div onClick={() => {debugger; dispatch({type: 'decrement'})}}>
    {state.count}
  </div>
}
createRoot(rootEl).render(<CreateReducer/ >);

// ReactDOM.createRoot(rootEl1).render(<div > createRoot</div>);

