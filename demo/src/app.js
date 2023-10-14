import React ,{useInsertionEffect,useLayoutEffect} from "react";
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

export default function(){
    function RootDom (){
        useLayoutEffect(()=>{
            console.log('useLayoutEffect')
        },[])
        const ruleText = 'body { background-color: lightblue; color: darkblue; }';
        useCSS(ruleText);

    
        return <div>222</div>
    }
    debugger
    createRoot(rootEl).render(<RootDom/ >);
}