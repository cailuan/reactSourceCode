import React , {useState} from "react";
import ReactDOM from "react-dom";
// import { useState } from "./myReact/react";
// import * as ReactDOM from "./myReact/react-dom";

const rootEl = document.getElementById("root");


debugger
const ProtalRoot = () => {
  const [rootState,setRootState] =  useState('root1')
  return ReactDOM.createPortal(<div onClick={()=>{
    console.log('root1')
    setRootState('root click')
  }}>{rootState}</div>, document.body);
};

const Protal = () => {
  return (
    <div>
      <ProtalRoot />
    </div>
  );
};

ReactDOM.createRoot(rootEl).render(<Protal />);
