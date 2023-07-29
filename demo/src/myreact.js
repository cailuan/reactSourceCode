// import React, { useState, useInsertionEffect } from "react";
// import ReactDOM from "react-dom";
import  React ,{ useState, createContext,useContext, useEffect,useDeferredValue } from "./myReact/react";
import * as ReactDOM from "./myReact/react-dom";

const ThemeContext = React.createContext({})


export function myReact(){
    const rootEl = document.getElementById("root");
    // eslint-disable-next-line react-hooks/rules-of-hooks

    debugger
    // console.log(process.env, 'process.env')
    // const ProtalRoot = () => {
    //   const [rootState, setRootState] = useState("root1");
    //   return ReactDOM.createPortal(
    //     <div
    //       onClick={() => {
    //         console.log("root1");
    //         setRootState("root click");
    //       }}
    //     >
    //       {rootState}
    //     </div>,
    //     document.body
    //   );
    // };
    
    // const Protal = () => {
    //   return (
    //     <div>
    //       <ProtalRoot />
    //     </div>
    //   );
    // };
    
    // const InsertionEffect = () => {
    //   useInsertionEffect(() => {
    //     console.log("useInsertionEffect");
    //   });
    //   return <div>111</div>;
    // };
    
    // const OtherComponent = React.lazy(() => import("./OtherComponent"));
    
    // let li = Array.from({length: 10000})

    // eslint-disable-next-line react-hooks/rules-of-hooks
   
    const SuspenseFn = () => {
      const [initState,setInitState] = useState(1)
      useEffect(()=>{
        setInitState((pre)=> ++pre)
      },[])
      // return (
      //   <React.Suspense fallback={<div>loading ....</div>}>
      //     <OtherComponent />
      //   </React.Suspense>
      // );

      return <ThemeContext.Provider value={{name:1}}>
        {Text()}
      </ThemeContext.Provider>
    };

    const DeferredValue = ()=>{
      const [query, setQuery] = useState('');
      const deferredQuery = useDeferredValue(query);
      return <div>
          <div onClick={()=>{setQuery('yyu')}}>Click</div>
          <div>{deferredQuery}</div>
      </div>
    }
    
    ReactDOM.createRoot(rootEl).render(<DeferredValue />);
}

