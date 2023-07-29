import React, { useState, createContext,useContext ,useEffect,useDeferredValue } from "react";
import ReactDOM from "react-dom";

const ThemeContext = createContext({})


export function originReact(){
    const rootEl = document.getElementById("root");

debugger;
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
