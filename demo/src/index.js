import React from "react";
import ReactDOM from "react-dom";
import App from "./demo_0";
import {createRoot} from "./myReact/react-dom/client/ReactDOMRoot"

const rootEl = document.getElementById("root");
const rootEl1 = document.getElementById("root1");
console.log(ReactDOM,"ReactDOM")
// ReactDOM.render(<App />, rootEl);

// ReactDOM.createRoot(rootEl).render('1222');

debugger
createRoot(rootEl).render(<div><div><p>2222</p><p>1111</p></div></div>);

// ReactDOM.createRoot(rootEl1).render(<div > createRoot</div>);
