import React from "react";
// import ReactDOM from "react-dom";

import {createContext , forwardRef} from './myReact/react/react'
import { createRoot } from "./myReact/react-dom";
import { useState,useRef,useEffect,useMemo,useCallback,useReducer,useLayoutEffect ,useContext, useImperativeHandle} from "./myReact/react";
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
    return ()=>{
      console.log('useLayoutEffect destory')
    }
  })
  return <div onClick={() => {debugger; dispatch({type: 'decrement'})}}>
    {state.count}
  </div>
}

const CreateReducers = ()=>{
  debugger
  const [initState,setInitState] = useState(1)
  useEffect(()=>{
    console.log('useEffect')
    setInitState(0)
    // return ()=>{
    //   console.log('useEffect destory')
    // }
  })
  console.log('CreateReducer')
  return <div onClick={()=>{
    debugger
    setInitState(initState+1)
    setInitState(initState+2)
  }}>
    {initState}
  </div>
}



let t = 0
const  DiffDom = ()=>{
  const [initState,setInitState] = useState([31,33,34,35])
  const changeState = ()=>{
    
    setInitState( [t++,...initState].slice(0,4))
  }
  console.log('DiffDom')
  return <div onClick={()=>{debugger ; changeState()}}>
    {
      initState.map(item=>{
        return <div key={item}>{item}</div>
      })
    }
  </div>
}


const ParentHost = ()=>{
  const parentRef = useRef(null)
  useLayoutEffect(()=>{
    console.log('parent layout',parentRef.current)
  },[])
  useEffect(()=>{
    console.log('parent effect',parentRef.current)
  },[])
  return <div ref={parentRef}><Children></Children></div>
}
const Children = ()=>{
  const childrentRef = useRef(null)
  useLayoutEffect(()=>{
    console.log('Children layout',childrentRef.current)
  },[])
  useEffect(()=>{
    console.log('Children effect',childrentRef.current)
  },[])
  return <div  ref={childrentRef}>Children</div>
}


const themes = {
  light: {
    foreground: "#000000",
    background: "#eeeeee"
  },
  dark: {
    foreground: "#ffffff",
    background: "#222222"
  }
};





const ThemeContext = React.createContext(themes.light);
const TDarkContext = React.createContext(themes.dark);


function App() {
  return (
    <ThemeContext.Provider value={themes.light}>
      <TDarkContext.Provider value={themes.dark}>
        <Toolbar />
      </TDarkContext.Provider>
      
    </ThemeContext.Provider>
  );
}

function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

function ThemedButton() {
  const theme = useContext(ThemeContext);
  const dark = useContext(TDarkContext)
  const [initState,setInitState] = useState(1)
  return (
    <div  onClick={()=>{debugger; setInitState(2)}}>
      <div >
        I am styled by theme context! {theme.background}
      </div>
      <div>{initState}</div>
      <div>
        {dark.background}
      </div>
    </div>
    
  );
}
function RootDom(){
  const inputRef = useRef()

  return (
    <div>
      <FancyInput ref={inputRef} />
      <button onClick={() => {inputRef.current?.focus();console.log(inputRef.current.value)}}>
        ??????input???focus??????
      </button>
    </div>

  )
}

const FancyInput = React.forwardRef((props, ref) => {
  const inputRef = useRef()
  useImperativeHandle(ref,()=>({
    focus: () => {
      inputRef.current.focus();
    }
  }))
  return (
  <div>
    <input ref={inputRef} type="text" />
    <div>?????????????????????????????????</div>
  </div>
)})





createRoot(rootEl).render(<RootDom/ >);

// ReactDOM.createRoot(rootEl1).render(<div > createRoot</div>);

