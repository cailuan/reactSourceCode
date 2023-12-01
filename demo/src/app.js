import React ,{useInsertionEffect,useLayoutEffect,useState,useRef,useEffect } from "react";
import {createRoot} from "react-dom/client";


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
    const [state,setState] = useState([1,2])
    return <div onClick={()=>{
        setState([3])
        }}>
        {
            state.map(item=>{
                return <div>{item}</div>
            })
        }
    </div>
}

class AppComponent extends React.Component {
  state = {
    age: 42,
  };

  componentDidMount() {
    debugger
    console.log("componentDidMount")
    this.setState({
      age : this.state.age + 30
    },()=>{
      console.log("age = 72")
    })
    this.setState({
      age : this.state.age + 10
    },()=>{
      console.log("age = 52")
    })

    setTimeout(()=>{
      this.setState({
        age : this.state.age + 30
      },()=>{
        console.log("age = 882")
      })
      this.setState({
        age : this.state.age + 10
      },()=>{
        console.log("age = 992")
      })
  
    },3000)
  }

  componentDidUpdate(){
    console.log("componentDidUpdate")
  }

  // componentWillUnmount(){
  //   console.log("AppComponent componentWillUnmount")
  // }

  // getSnapshotBeforeUpdate(){
  //   console.log("getSnapshotBeforeUpdate")
  // }

  static getDerivedStateFromProps(){
    debugger;
    console.log("getDerivedStateFromProps")
    return {
      name :" p"
    }
  }
  getSnapshotBeforeUpdate(prevProps, prevState) {
    console.log(prevProps, prevState,"getSnapshotBeforeUpdate")
    return null;
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   console.log(nextProps,nextState , 'shouldComponentUpdate');
  //   return false;
  // }
  
  render(){
    console.log(this.state.age, 'age')
    return  this.state.age 
  }
}

class ChildComponent extends React.Component {
  componentDidMount() {
    debugger
    console.log("ChildComponent componentDidMount")
 
  }
  componentWillUnmount(){
    console.log("ChildComponent componentWillUnmount")
  }
  render (){
    return <div><ChildChildComponent></ChildChildComponent></div>
  }
}

class ChildChildComponent extends React.Component {
  componentWillUnmount(){
    console.log("ChildChildComponent componentWillUnmount")
  }
  render(){
    return <div>ChildComponent</div>
  }
} 

function Test(){
  const [state,setState ] = useState(1)
  useEffect(()=>{
    debugger
    setState(2)
    return ()=>{
      debugger
    }
  },[state])
  useLayoutEffect(()=>{
    debugger
    return ()=>{
      debugger
    }
  },[state])
  return state 
}
function ChildComponents(){
  useEffect(()=>{
    debugger

    return ()=>{
      console.log("ChildComponents useEffect")
      debugger
    }
  },[])
  useLayoutEffect(()=>{
    debugger
    return ()=>{
      console.log("ChildComponents useLayoutEffect")
      debugger
    }
  })
  return <div>child</div>
}


export default function(){
    document.title = "origin react"
    debugger
    createRoot(rootEl).render(<AppComponent />);
}