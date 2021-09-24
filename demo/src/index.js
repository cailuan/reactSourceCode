import React from "react";
import ReactDOM from "react-dom";
import App from "./demo_0";

const rootEl = document.getElementById("root");
const rootEl1 = document.getElementById("root1");
console.log(ReactDOM,"ReactDOM")
// ReactDOM.render(<App />, rootEl);
ReactDOM.createRoot(rootEl).render(<App />);

// ReactDOM.createRoot(rootEl1).render(<div > createRoot</div>);
