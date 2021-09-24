import  { useEffect, useLayoutEffect, useState } from "react";

export default function App() {
  const [count, setCount] = useState(0);
  
  useEffect(()=>{
    console.log(count,"useEffect")
  },[count])

  useLayoutEffect(()=>{
    console.log("useLayoutEffect")
  },[])

  return (
    <div>
      <h1
        onClick={() => {
          // debugger;
          setCount(() => count + 1);
        }}
      >
        {count}
      </h1>
    </div>
  );
}


function Srp(){
  return <div>srp</div>
}