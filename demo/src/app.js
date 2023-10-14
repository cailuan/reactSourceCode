import React ,{useInsertionEffect,useLayoutEffect,useState,useRef} from "react";
import {createRoot} from "react-dom";

const rootEl = document.getElementById("root");


function getStyleForRule(ruleText) {
    // 创建一个空的<style>元素
    const style = document.createElement('style');
   
    document.head.appendChild(style);
    // 将 CSS 规则添加到<style>元素中
    style.sheet.insertRule(ruleText, 0);
  
    // 获取添加后的规则
    const rule = style.sheet.cssRules[0];
  
    // 提取样式对象
    const styleObject = {};
    for (let i = 0; i < rule.style.length; i++) {
      const property = rule.style[i];
      const value = rule.style.getPropertyValue(property);
      styleObject[property] = value;
    }
  
    return style;
  }
  

let isInserted = new Set();
function useCSS(rule) {
  useInsertionEffect(() => {
    console.log('useInsertionEffect')
    // 同前所述，我们不建议在运行时注入 <style> 标签。
    // 如果你必须这样做，那么应当在 useInsertionEffect 中进行。
    if (!isInserted.has(rule)) {
      isInserted.add(rule);
      getStyleForRule(rule)
    }
  });
  return rule;
}

const Host = ()=>{
    debugger
    const [initState,setInitState] = useState(11)
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
  function RootDom (){
    useLayoutEffect(()=>{
        console.log('useLayoutEffect')
    },[])
    const ruleText = 'body { background-color: lightblue; color: darkblue; }';
    useCSS(ruleText);


    return <div>222</div>
}

function RootY(){
    const [state,setState] = useState(true)
    return <div>
        {state && <div>2222</div>}
        <div onClick={()=>{setState(false)}}>1111</div>
    </div>
}

export default function(){
    document.title = "origin react"
    debugger
    createRoot(rootEl).render(<RootY/ >);
}