import React, { useState, useInsertionEffect } from "react";
import ReactDOM from "react-dom";


export function originReact(){
    const rootEl = document.getElementById("root");

debugger;
const ProtalRoot = () => {
  const [rootState, setRootState] = useState("root1");
  return ReactDOM.createPortal(
    <div
      onClick={() => {
        console.log("root1");
        setRootState("root click");
      }}
    >
      {rootState}
    </div>,
    document.body
  );
};

const Protal = () => {
  return (
    <div>
      <ProtalRoot />
    </div>
  );
};

// const InsertionEffect = () => {
//   useInsertionEffect(() => {
//     console.log("useInsertionEffect");
//   });
//   return <div>111</div>;
// };

const OtherComponent = React.lazy(() => import("./OtherComponent"));

let li = Array.from({length: 10000})
const SuspenseFn = () => {
  return (
    <React.Suspense fallback={<div>loading ....</div>}>
      <OtherComponent />
    </React.Suspense>
  );
};

ReactDOM.createRoot(rootEl).render(<SuspenseFn />);
}