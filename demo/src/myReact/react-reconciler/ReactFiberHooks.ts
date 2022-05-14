import ReactSharedInternals from "../shared/ReactSharedInternals"
import { NoLanes } from "./ReactFiberLane";
import { readContext } from "./ReactFiberNewContext";
import { requestEventTime, requestUpdateLane } from "./ReactFiberWorkLoop";
const {ReactCurrentDispatcher} = ReactSharedInternals

let currentHookNameInDev:string|null = null
let HooksDispatcherOnMountInDEV:any = null
let workInProgressHook:any = null
let currentlyRenderingFiber:any = null
let hookTypesDev:any = null
HooksDispatcherOnMountInDEV = {
  useState:(initialState)=>{
    currentHookNameInDev = 'useState'
    mountHookTypesDev()
    const prevDispatcher = ReactCurrentDispatcher.current;
    ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV as any;
    try{
      return mountState(initialState)
    }finally{
      ReactCurrentDispatcher.current = prevDispatcher;
    }
  }
}



const InvalidNestedHooksDispatcherOnMountInDEV = {
  useState:(initialState)=>{
    currentHookNameInDev = 'useState';
    const prevDispatcher = ReactCurrentDispatcher.current;
    ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV as any;
    try {
      return mountState(initialState);
    } finally {
      ReactCurrentDispatcher.current = prevDispatcher;
    }
  }
}

function mountState(initialState){
  const hook = mountWorkInProgressHook()
  if(typeof initialState === 'function'){
    initialState = initialState()
  }
  hook.memoizedState = hook.baseState = initialState

  const quene:any = {
    pending : null,
    interleaved: null,
    lanes : NoLanes,
    dispatch : null,
    lastRenderedReducer : basicStateReducer,
    lastRenderedState : initialState
  }

  const dispatch = quene.dispatch = dispatchAction.bind(null,currentlyRenderingFiber,quene)

  return [hook.memoizedState,dispatch]

}

function throwInvalidHookError() {
  console.error(
    'Invalid hook call. Hooks can only be called inside of the body of a function component. This could happen for' +
      ' one of the following reasons:\n' +
      '1. You might have mismatching versions of React and the renderer (such as React DOM)\n' +
      '2. You might be breaking the Rules of Hooks\n' +
      '3. You might have more than one copy of React in the same app\n' +
      'See https://reactjs.org/link/invalid-hook-call for tips about how to debug and fix this problem.',
  );
}

export const ContextOnlyDispatcher:any = {
  readContext:readContext,
  useCallback: throwInvalidHookError,
  useContext: throwInvalidHookError,
  useEffect: throwInvalidHookError,
  useImperativeHandle: throwInvalidHookError,
  useLayoutEffect: throwInvalidHookError,
  useMemo: throwInvalidHookError,
  useReducer: throwInvalidHookError,
  useRef: throwInvalidHookError,
  useState: throwInvalidHookError,
  useDebugValue: throwInvalidHookError,
  useDeferredValue: throwInvalidHookError,
  useTransition: throwInvalidHookError,
  useMutableSource: throwInvalidHookError,
  useOpaqueIdentifier: throwInvalidHookError,
}

export function renderWithHooks(current,workInProgress,Component,props,secondArg,nextRenderLanes){
  currentlyRenderingFiber = workInProgress
  workInProgress.lanes = NoLanes
  ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV
  let children = Component(props, secondArg)
  ReactCurrentDispatcher.current = ContextOnlyDispatcher
  return children
}

function mountWorkInProgressHook(){
  const hook = {
    memoizedState: null,

    baseState: null,
    baseQueue: null,
    queue: null,

    next: null,
  };
  if(workInProgressHook == null){
    currentlyRenderingFiber.memoizedState = workInProgressHook = hook
  }
  return workInProgressHook
}

function mountHookTypesDev(){
  const hookName =  currentHookNameInDev
  if(hookTypesDev == null){
    hookTypesDev = [hookName]
  }else{
    hookTypesDev.push(hookName);
  }
}

function basicStateReducer(state,action){
  return typeof action === 'function' ? action(state) : state
} 


function dispatchAction(fiber,queue,action){
  const eventTime = requestEventTime()
  const lane = requestUpdateLane(fiber)
  // todo 
}