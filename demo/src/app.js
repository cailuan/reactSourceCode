import React ,{useInsertionEffect,useLayoutEffect,useState,useRef,useEffect,useReducer,useTransition, useDeferredValue } from "react";
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

function Root(){
  const [data, setData] = useState(2);
  const [source, setSource] = useState(1);
  
  const setStateFn = () => {
    console.log("click setStateFn")
    setSource(()=>{
      setData(4);
      return 3;
    })
    setSource(()=>{
      setData(()=>{
        setSource(7)
        return 6
      });
      return 5;
    })
  }
  console.log(`state = ${source}, data = ${data}`)
  return <div onClick={setStateFn}>{data}</div>;
}


function ChildrenState(){
  const [childrenState, setChildrenState] = useState(1);
  let otherState
  if(childrenState == 1){
    // eslint-disable-next-line react-hooks/rules-of-hooks
    otherState = useState(2);
  }else {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    otherState = useState(3);
  }
  const setStateFn = ()=>{
    console.log("方法点击事件")
    setChildrenState(1)
    setChildrenState(10)
    otherState[1](90)
  }
  console.log("childrenState = ", childrenState , "otherState = ", otherState[0])
  return <div onClick={()=>[
   
    setStateFn()
  ]}>{otherState[0]}</div>;
}

function reducer(state, action) {
  let result = action
  if(typeof action == 'function' ){
    result = action(state)
  }
  return {
    ...state,
    ...result
  }
}

function createInitialState(name){
  return {
    useName : name
  }
}

function ReducerRoot (){
  const [state2, dispatch2] = useReducer(reducer, 'cailuan', createInitialState);
  const [state1, dispatch1] = useReducer(reducer, 'cla', createInitialState);
 
  const dispatchFn = ()=>{
    debugger;
    dispatch1(()=>{
      dispatch2({dispatch1 : true })
      return {
        age: "11"
      }
    })
    dispatch1({
      useName: 'change  cla'
    })
    dispatch2({
      changeStatue: true
    })
  }
  console.log(state1,'state1-', state2 , "state2-")
  return <div onClick={dispatchFn}>{state1.useName}</div>
}

function App() {
  const [disabled, setDisabled] = React.useState(false);
  return (
    <>
      <button onClick={() => setDisabled((prev) => !prev)}>Disable</button>
      <div>{`Disabled? ${disabled}`}</div>
      <CounterReducer disabled={disabled} />
      <CounterState disabled={disabled} />
    </>
  );
}
function CounterReducer({ disabled }) {
  const [count, dispatch] = useReducer((state) => {
    if (disabled) {
      return state;
    }
    return state + 1;
  }, 0);
  return (
    <>
      <button onClick={dispatch}>reducer + 1</button>
      <div>{`Count ${count}`}</div>
    </>
  );
}

function CounterState({ disabled }) {
  const [count, dispatch] = useState(0);

  function dispatchAction() {
    dispatch((state) => {
      if (disabled) {
        return state;
      }
      return state + 1;
    });
  }

  return (
    <>
      <button onClick={dispatchAction}>state + 1</button>
      <div>{`Count ${count}`}</div>
    </>
  );
}


function TranstionRoot(){
  const [isPending1, startTransition1] = useTransition();
  const [isPending2, startTransition2] = useTransition();
  // const [state,setState] = useState(false);
  const click = ()=>{
    debugger
    startTransition1(() => {
      console.log('click') ;
    
    })
    startTransition2(() => {
      console.log('click') ;
    
    })
  }
  console.log("isPending1 = ",isPending1,"isPending2 =" ,isPending2)
  return <div >
    TranstionRoot
    {/* <ChildRoot childLen ={} /> */}
  </div>
}

function RootTransition(){
  const [state, setState] = useState(0);
  const [tag, setTag] = useState('tag');
  const [isPending, startTransition] = useTransition();

  const getRe = async ()=>{
    return 1 
  }

  const changeGn= (e)=>{
    window.nodeValue = e.target.value
    setTag("pending")
    
    startTransition(async ()=>{
      console.log(e.target.value,'startTransition')
      setTag("transition")
      await getRe()
      setState(e.target.value)
    })
    // setState(e.target.value)
  }
  console.log(state, tag)
  return <div>
    <input onChange={changeGn} />
    <ChildRoot childLen ={state} tag={tag} />
  </div>
}

function ChildRoot({childLen, tag}){
  const len = Array(Number(childLen)).fill(0)
  // console.log(len,'len')
  return <div>
    {
      len.map((_,index)=>{
        return <SlowPost index={index} tag={tag} childLen={childLen} />
      })
    }
  </div>
}

function SlowPost({ index ,tag, childLen}) {
  let startTime = performance.now();
  // while (performance.now() - startTime < 100) {
  //   // 每个 item 都等待 1 毫秒以模拟极慢的代码。
  // }

  return (
    <li className="item">
      index = {index + 1} - status = {tag} - len = {childLen}
    </li>
  );
}

function RootDeferredValue(){
  const [text, setText] = useState('');
  const [tag, setTag] = useState('tag');
  const deferredQuery = useDeferredValue(text);
  return <div>
    <input value={text} onChange={e => setText(e.target.value)} />
    <ChildRoot  childLen ={deferredQuery} tag={tag} />
  </div>
}


function RootTransitions(){
  const [initState, setInitState] = useState(1);
  const [ pending, startTransition ] = useTransition(initState);
  const clickTransition = ()=>{
    debugger
    startTransition(()=>{
      setInitState(2)
    })
  }
  console.log(pending ,initState )
  return <div onClick={clickTransition}>
    {initState}
  </div>
}


export default function(){
    document.title = "origin react"
    debugger
    createRoot(rootEl).render(<RootTransitions />);
}