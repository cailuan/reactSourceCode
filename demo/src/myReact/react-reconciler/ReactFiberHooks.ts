import ReactSharedInternals from "../shared/ReactSharedInternals"
import { NoLanes } from "./ReactFiberLane";
import { readContext } from "./ReactFiberNewContext";
import { requestEventTime, requestUpdateLane, scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
const {ReactCurrentDispatcher} = ReactSharedInternals

let currentHookNameInDev:string|null = null
let HooksDispatcherOnMountInDEV:any = null
let HooksDispatcherOnUpdateInDEV:any = null
let workInProgressHook:any = null
let currentlyRenderingFiber:any = null
let hookTypesDev:any = null
let InvalidNestedHooksDispatcherOnUpdateInDEV:any = null

let hookTypesUpdateIndexDev = -1


let currentHook:any = null

function updateHookTypesDev(){
  const hookName = currentHookNameInDev
  if(hookTypesDev !== null){
    hookTypesUpdateIndexDev++
    if(hookTypesDev[hookTypesUpdateIndexDev] != hookName){
        console.error('hooks error')
    }
  }
}

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
  },
  useRef:(initialValue)=>{
    currentHookNameInDev = 'useRef'
    mountHookTypesDev()
    return mountRef(initialValue)
  }
}

HooksDispatcherOnUpdateInDEV ={
  useState:(initialState)=>{
    currentHookNameInDev = 'useState';
    updateHookTypesDev()
    const prevDispatcher = ReactCurrentDispatcher.current;
    ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
    try {
      return updateState(initialState);
    } finally {
      ReactCurrentDispatcher.current = prevDispatcher;
    }
  },
  useRef:(initialValue)=>{
    currentHookNameInDev = 'useRef';
    updateHookTypesDev()
    return updateRef(initialValue);
  }
}


InvalidNestedHooksDispatcherOnUpdateInDEV = {
  useState : (initialState)=>{
    currentHookNameInDev = 'useState';
    // updateHookTypesDev()
    const prevDispatcher = ReactCurrentDispatcher.current;
    ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
    try {
      return updateState(initialState);
    } finally {
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

function mountRef(initialValue){
  const hook = mountWorkInProgressHook()
  const ref = {current: initialValue}
  hook.memoizedState = ref;
  return ref;
}
function updateRef(initialValue){
  const hook = updateWorkInProgressHook()
  return hook.memoizedState;
}

function mountState(initialState){
  const hook = mountWorkInProgressHook()
  if(typeof initialState === 'function'){
    initialState = initialState()
  }
  hook.memoizedState = hook.baseState = initialState

  const quene:any  =  hook.queue = {
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
function updateWorkInProgressHook(){
  let nextCurrentHook
  if(currentHook == null){
    const current = currentlyRenderingFiber.alternate;
    if(current != null){
      nextCurrentHook = current.memoizedState;
    }
  }else{
    nextCurrentHook = currentHook.next;
  }
  let nextWorkInProgressHook
  if(workInProgressHook == null) {
    nextWorkInProgressHook = currentlyRenderingFiber.memoizedState;
  }else{
    nextWorkInProgressHook = workInProgressHook.next
  }


  if(nextWorkInProgressHook!= null){

  }else{
    currentHook  = nextCurrentHook
    const newHook = {
      memoizedState: currentHook.memoizedState,

      baseState: currentHook.baseState,
      baseQueue: currentHook.baseQueue,
      queue: currentHook.queue,

      next: null,
    };

    if (workInProgressHook == null){
      currentlyRenderingFiber.memoizedState = workInProgressHook = newHook
    }else{
      workInProgressHook = workInProgressHook.next = newHook
    }
  }
  return workInProgressHook;
  
}

function updateReducer(reducer,initialArg,init?:any){
  const hook = updateWorkInProgressHook();
  const queue = hook.queue;
  queue.lastRenderedReducer = reducer
  const current = currentHook
  let baseQueue = current.baseQueue;
  const pendingQueue = queue.pending;
  if(pendingQueue != null){
    current.baseQueue = baseQueue = pendingQueue;
    queue.pending = null;
  }
  

  if(baseQueue != null){
    const first = baseQueue.next;
    let newState = current.baseState;
    let newBaseState = null;
    let newBaseQueueFirst = null;
    let newBaseQueueLast = null;
    let update = first;
    do{
      const updateLane = update.lane;
      if(update.eagerReducer == reducer){
        newState = update.eagerState
      }else{
        const action = update.action;
        newState = reducer(newState, action);
      }
      update = update.next
    } while(update != null && update != first)
    if(newBaseQueueLast === null){
      newBaseState = newState
    }
    if(!Object.is(newState , hook.memoizedState)){
      // markWorkInProgressReceivedUpdate()
    }
    hook.memoizedState = newState
    hook.baseState = newBaseState
    hook.baseQueue = newBaseQueueLast
    queue.lastRenderedState = newState;

  }

  if(baseQueue == null){
    queue.lanes = NoLanes
  }
  const dispatch = queue.dispatch
  return [hook.memoizedState, dispatch]

}
function updateState(initialState){
  return updateReducer(basicStateReducer,initialState)
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
  workInProgress.memoizedState = null;
  workInProgress.lanes = NoLanes
  hookTypesUpdateIndexDev = -1
  if (current !== null && current.memoizedState !== null) {
    ReactCurrentDispatcher.current = HooksDispatcherOnUpdateInDEV;
  }else{
    ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV
  }
  
  let children = Component(props, secondArg)
  ReactCurrentDispatcher.current = ContextOnlyDispatcher
  currentHook = null;
  workInProgressHook = null;
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
  }else{
    workInProgressHook = workInProgressHook.next = hook
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
  return typeof action === 'function' ? action(state) : action
} 


function dispatchAction(fiber,queue,action){
  const eventTime = requestEventTime()
  const lane = requestUpdateLane(fiber)
  const update:any = {
    lane,
    action,
    eagerReducer : null,
    eagerState : null,
    next:null
  }
  const alternate = fiber.alternate;

  const pending = queue.pending
  if(pending == null){
    update.next = update
  }else {
    update.next = pending.next
    pending.next = update
  }
  queue.pending = update;
  if(fiber.lanes === NoLanes && (alternate == null || alternate.lanes == NoLanes) ){
    const lastRenderedReducer = queue.lastRenderedReducer;
    if(lastRenderedReducer != null){
      let prevDispatcher  = ReactCurrentDispatcher.current

      ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
      try {
        const currentState = queue.lastRenderedState
        const eagerState = lastRenderedReducer(currentState,action)
        update.eagerReducer = lastRenderedReducer
        update.eagerState = eagerState;
        if(Object.is(eagerState, currentState)){
          return
        }
      }finally{
    
        ReactCurrentDispatcher.current = prevDispatcher;
      }
    }
  }
  scheduleUpdateOnFiber(fiber,lane,eventTime)
}