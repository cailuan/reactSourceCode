import objectIs from "../shared/objectIs";
import ReactSharedInternals from "../shared/ReactSharedInternals"
import { getCurrentUpdatePriority, setCurrentUpdatePriority ,ContinuousEventPriority, higherEventPriority} from "./ReactEventPriorities";
import { markWorkInProgressReceivedUpdate } from "./ReactFiberBeginWork";
import { enqueueConcurrentHookUpdate } from "./ReactFiberConcurrentUpdates";
import { Passive as PassiveEffect, PassiveStatic as PassiveStaticEffect, Update as UpdateEffect ,LayoutStatic as LayoutStaticEffect ,MountLayoutDev as MountLayoutDevEffect, Update} from "./ReactFiberFlags";
import { NoLanes ,removeLanes,isSubsetOfLanes, NoLane ,isTransitionLane ,intersectLanes, mergeLanes} from "./ReactFiberLane";
import { readContext } from "./ReactFiberNewContext";
import { requestEventTime, requestUpdateLane, scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
import { Passive as HookPassive ,HasEffect as HookHasEffect,Layout as HookLayout, } from "./ReactHookEffectTags";
import { NoMode, StrictEffectsMode } from "./ReactTypeOfMode";
const {ReactCurrentDispatcher , ReactCurrentBatchConfig} = ReactSharedInternals

let currentHookNameInDev:string|null = null
let HooksDispatcherOnMountInDEV:any = null
let HooksDispatcherOnUpdateInDEV:any = null
let workInProgressHook:any = null
let currentlyRenderingFiber:any = null
let hookTypesDev:any = null
let InvalidNestedHooksDispatcherOnUpdateInDEV:any = null

let renderLanes = NoLanes;

let hookTypesUpdateIndexDev = -1


let currentHook:any = null

function updateHookTypesDev(){
  const hookName = currentHookNameInDev
  if(hookTypesDev != null){
    hookTypesUpdateIndexDev++
    if(hookTypesDev[hookTypesUpdateIndexDev] != hookName){
        console.error('hooks error')
    }
  }
}

HooksDispatcherOnMountInDEV = {
  readContext:()=>{

  },
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
  },
  useEffect:(create,deps)=>{
    currentHookNameInDev = 'useEffect'
    mountHookTypesDev()
    return mountEffect(create,deps)
  },
  useMemo:(create,deps)=>{
    currentHookNameInDev = 'useMemo'
    mountHookTypesDev()
    const prevDispatcher = ReactCurrentDispatcher.current;
    ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV as any
    try{
      return mountMemo(create,deps)
    }finally{
      ReactCurrentDispatcher.current = prevDispatcher
    }
  },
  useCallback:(create,deps)=>{
    currentHookNameInDev = 'useCallback'
    mountHookTypesDev()
    return mountCallback(create,deps)
  },
  useReducer:(reducer, initialArg, init)=>{
    currentHookNameInDev =  'useReducer'
    mountHookTypesDev()
    const prevDispatcher = ReactCurrentDispatcher.current;
    ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnMountInDEV as any
    try{
      return mountReducer(reducer, initialArg, init)
    }finally{
      ReactCurrentDispatcher.current = prevDispatcher
    }
  },
  useLayoutEffect:(create,deps)=>{
    currentHookNameInDev = 'useLayoutEffect';
    mountHookTypesDev()
    return mountLayoutEffect(create,deps)
  },
  useContext:(context)=>{
    currentHookNameInDev = 'useContext';
    mountHookTypesDev()

    return readContext(context)
  },
  useImperativeHandle:(ref,create,deps)=>{
    currentHookNameInDev = 'useImperativeHandle'
    mountHookTypesDev();
    return mountImperativeHandle(ref,create,deps)
  },
  useTransition:()=>{
    currentHookNameInDev = 'useTransition';
    mountHookTypesDev();
    return mountTransition()
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
  },
  useEffect:(create,deps)=>{
    currentHookNameInDev = 'useEffect';
    updateHookTypesDev()
    return updateEffect(create, deps)
  },
  useMemo:(create,deps)=>{
    currentHookNameInDev = 'useMemo';
    updateHookTypesDev()
    const prevDispatcher = ReactCurrentDispatcher.current;
    ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
    try{
      return updateMemo(create, deps)
    }finally{
      ReactCurrentDispatcher.current = prevDispatcher;
    }
  },
  useCallback:(create,deps)=>{
    currentHookNameInDev = 'useCallback'
    updateHookTypesDev()
    return updateCallback(create,deps)
  },
  useReducer:(reducer, initialArg, init)=>{
    currentHookNameInDev = 'useReducer'
    updateHookTypesDev()
    const prevDispatcher = ReactCurrentDispatcher.current;
    ReactCurrentDispatcher.current = InvalidNestedHooksDispatcherOnUpdateInDEV;
    try{
      return updateReducer(reducer, initialArg, init);
    }finally{
      ReactCurrentDispatcher.current = prevDispatcher;
    }
  },
  useLayoutEffect:(create,deps)=>{
    currentHookNameInDev = 'useLayoutEffect'
    updateHookTypesDev()
    return updateLayoutEffect(create, deps);
  },
  useContext: (context)=>{
    currentHookNameInDev = 'useLayoutEffect'
    updateHookTypesDev()
    return readContext(context)
  },
  useImperativeHandle: (ref,create,deps)=>{
    currentHookNameInDev = 'useImperativeHandle';
    updateHookTypesDev();
    return updateImperativeHandle(ref, create, deps)
  },
  useTransition: ()=>{
    currentHookNameInDev = 'useTransition';
    updateHookTypesDev()
    return updateTransition()
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

function updateTransition(){
  const [isPending] = updateState(false)
  const hook =  updateWorkInProgressHook()
  const start =  hook.memoizedState
  return [isPending, start];

}

function startTransition(setPending,callback,options){
  const previousPriority =  getCurrentUpdatePriority()
  setCurrentUpdatePriority(higherEventPriority(previousPriority,ContinuousEventPriority))
  setPending(true)

  const prevTransition = ReactCurrentBatchConfig.transition
  ReactCurrentBatchConfig.transition = {} ;
  const currentTransition = ReactCurrentBatchConfig.transition;
  
  ReactCurrentBatchConfig.transition._updatedFibers = new Set();

  try{
    setPending(false);
    callback();
  }finally{
    setCurrentUpdatePriority(previousPriority)
    ReactCurrentBatchConfig.transition = prevTransition;
    if (prevTransition == null && currentTransition._updatedFibers) {
      const updatedFibersCount = currentTransition._updatedFibers.size;
      if (updatedFibersCount > 10) {
        console.warn(
          'Detected a large number of updates inside startTransition. ' +
            'If this is due to a subscription please re-write it to use React provided hooks. ' +
            'Otherwise concurrent mode guarantees are off the table.',
        );
      }
      currentTransition._updatedFibers.clear();
    }
  }

}

function mountTransition(){
  const [ isPending , setPending] = mountState(false)
  const start = startTransition.bind(null, setPending);

  const hook = mountWorkInProgressHook();
  hook.memoizedState = start;
  return [isPending, start];
}



function updateImperativeHandle(ref,create,deps){
  const effectDeps = deps != null && deps != undefined ? deps.concat([ref]) : null;
  return updateEffectImpl(UpdateEffect,HookLayout,imperativeHandleEffect.bind(null,create,ref),effectDeps)
}

function mountImperativeHandle(ref,create,deps){
  const effectDeps = deps != null && deps != undefined ? deps.concat([ref]) : null
  let fiberFlags = UpdateEffect
  fiberFlags |= LayoutStaticEffect

  if((currentlyRenderingFiber.mode & StrictEffectsMode ) != NoMode){
    fiberFlags |= MountLayoutDevEffect
  }
  return mountEffectImpl(fiberFlags,HookLayout,imperativeHandleEffect.bind(null, create, ref),effectDeps)
}

function imperativeHandleEffect(create,ref){
  if(typeof ref == 'function'){
    const refCallback = ref;
    const inst = create();
    refCallback(inst);
    return () => {
      refCallback(null);
    };

  }else if(ref != null && ref != undefined){
    const refObject = ref;
    const inst = create();
    refObject.current = inst;
    return () => {
      refObject.current = null;
    };
  }
}

function mountLayoutEffect(create,deps){
  let fiberFlags = UpdateEffect
  fiberFlags |= LayoutStaticEffect
  if((currentlyRenderingFiber.mode & StrictEffectsMode) != NoMode){
    fiberFlags |= MountLayoutDevEffect
  }
  return mountEffectImpl(fiberFlags,HookLayout, create, deps)
}

function updateLayoutEffect(create,deps){
  return updateEffectImpl(UpdateEffect,HookLayout,create,deps)
}

function mountReducer(reducer,initialArg,init){
  const hook = mountWorkInProgressHook()
  let initialState;
  if(init != undefined){
    initialState = init(initialArg)
  }else{
    initialState = initialArg
  }
  hook.memoizedState = hook.baseState = initialState
  const queue = (hook.queue = {
    pending : null,
    interleaved : null,
    lanes : NoLanes,
    dispatch : null,
    lastRenderedReducer : reducer,
    lastRenderedState : initialState
  })
  const dispatch = (queue.dispatch = dispatchSetState.bind(null,currentlyRenderingFiber,queue) as any)
  return [hook.memoizedState,dispatch]
}

function mountCallback(callback,deps){
  const hook =  mountWorkInProgressHook()
  const nextDeps = deps == undefined ? null : deps
  hook.memoizedState = [callback, nextDeps];
  return callback;
}

function updateCallback(callback,deps){
  const hook = updateWorkInProgressHook()
  const nextDeps = deps == undefined ? null : deps
  const prevState = hook.memoizedState
  if(prevState != null){
    if(nextDeps != null){
      const prevDeps = prevState[1]
      if(areHookInputsEqual(nextDeps,prevDeps)){
        return prevState[0]
      }
    }
  }
  hook.memoizedState = [callback, nextDeps];
  return callback;
}

function mountMemo(nextCreate, deps){
  const hook = mountWorkInProgressHook()
  const nextDeps = deps == undefined ? null : deps;
  const nextValue = nextCreate()
  hook.memoizedState = [nextValue,nextDeps]
  return nextValue;
}

function updateMemo(nextCreate,deps){
  const hook = updateWorkInProgressHook()
  const nextDeps = deps == undefined ? null : deps
  const prevState = hook.memoizedState;
  if(prevState != null){
    if(nextDeps != null){
      const prevDeps = prevState[1]
      if(areHookInputsEqual(nextDeps , prevDeps)){
        return prevState[0]
      }
    }
  }
  const nextValue = nextCreate()
  hook.memoizedState = [nextValue,nextDeps]
  return nextValue
}

function mountEffect(create, deps){
  return mountEffectImpl(PassiveEffect | PassiveStaticEffect,HookPassive,create,deps)
}

function updateEffect(create ,deps){
  return updateEffectImpl(PassiveEffect,HookPassive,create,deps)
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
  if(typeof initialState == 'function'){
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

  const dispatch = quene.dispatch = dispatchSetState.bind(null,currentlyRenderingFiber,quene)

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
    let newBaseQueueFirst:any = null;
    let newBaseQueueLast:any = null;
    let update = first;
    do{
      const updateLane = update.lane;

      const isHiddenUpdate = updateLane != update.lane;
      const shouldSkipUpdate = !isSubsetOfLanes(renderLanes,updateLane)
      if(shouldSkipUpdate){
        const clone = {
          lane: updateLane,
          action: update.action,
          hasEagerState: update.hasEagerState,
          eagerState: update.eagerState,
          next:null
        }
        if (newBaseQueueLast == null) {
          newBaseQueueFirst = newBaseQueueLast = clone;
          newBaseState = newState;
        } else {
          newBaseQueueLast = newBaseQueueLast.next = clone;
        }
        currentlyRenderingFiber.lanes = mergeLanes(currentlyRenderingFiber.lanes , updateLane)
      }else{
        if(newBaseQueueLast){
          const clone= {
            lane: NoLane,
            action: update.action,
            hasEagerState: update.hasEagerState,
            eagerState: update.eagerState,
            next:  null,
          }
          newBaseQueueLast = newBaseQueueLast.next = clone;
        }
        if(update.eagerReducer ){
          newState = update.eagerState
        }else{
          const action = update.action;
          newState = reducer(newState, action);
        }
      }


      
      update = update.next
    } while(update != null && update != first)
    if(newBaseQueueLast == null){
      newBaseState = newState
    }else{
      newBaseQueueLast.next = newBaseQueueFirst
    }
    if(!Object.is(newState , hook.memoizedState)){
      markWorkInProgressReceivedUpdate()
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


function mountEffectImpl(fiberFlags,hookFlags,create,deps){
  const hook = mountWorkInProgressHook()
  const nextDeps = deps == undefined ? null : deps
  currentlyRenderingFiber.flags |= fiberFlags
  hook.memoizedState = pushEffect(HookHasEffect | hookFlags , create,undefined,nextDeps)
}

function pushEffect(tag,create,destroy,deps){
  const effect:any = {
    tag,
    create,
    destroy,
    deps,
    next:null
  }
  let componentUpdateQueue = currentlyRenderingFiber.updateQueue
  if(componentUpdateQueue == null){
    componentUpdateQueue = createFunctionComponentUpdateQueue()
    currentlyRenderingFiber.updateQueue = componentUpdateQueue
    componentUpdateQueue.lastEffect = effect.next = effect;
  }else{
    const lastEffect = componentUpdateQueue.lastEffect;
    if(lastEffect == null){
      componentUpdateQueue.lastEffect = effect.next = effect;
    }else{
      const firstEffect = lastEffect.next;
      lastEffect.next = effect;
      effect.next = firstEffect;
      componentUpdateQueue.lastEffect = effect;
    }
    

  }
  return effect
}

function updateEffectImpl(fiberFlags,hookFlags,create,deps){
  const hook = updateWorkInProgressHook()
  const nextDeps = deps == undefined ? null : deps
  let destroy = undefined;
  if(currentHook != null){
    const prevEffect = currentHook.memoizedState
    destroy = prevEffect.destroy;
    if (nextDeps != null) {
      const prevDeps = prevEffect.deps;
      if(areHookInputsEqual(nextDeps,prevDeps)){
        hook.memoizedState = pushEffect(hookFlags,create,destroy,nextDeps)
        return
      }
    }
  } 
  currentlyRenderingFiber.flags |= fiberFlags;
  hook.memoizedState = pushEffect(HookHasEffect | hookFlags , create, destroy ,nextDeps)
}

function areHookInputsEqual(nextDeps,prevDeps){
  if(prevDeps == null){
    return false
  }
  if(nextDeps.length != prevDeps.length){
    console.error('length no equet ')
  }
  for(let i = 0 ; i< nextDeps.length && i < prevDeps.length ; i++){
    if(objectIs(nextDeps[i],prevDeps[i])){
      continue
    }
    return false
  }
  return true
}

function createFunctionComponentUpdateQueue(){
  return {
    lastEffect: null,
  }
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
  renderLanes = nextRenderLanes;
  currentlyRenderingFiber = workInProgress
  workInProgress.memoizedState = null;
  workInProgress.updateQueue = null
  workInProgress.lanes = NoLanes
  hookTypesUpdateIndexDev = -1
  if (current != null && current.memoizedState != null) {
    ReactCurrentDispatcher.current = HooksDispatcherOnUpdateInDEV;
  }else{
    ReactCurrentDispatcher.current = HooksDispatcherOnMountInDEV
  }
  
  let children = Component(props, secondArg)
  ReactCurrentDispatcher.current = ContextOnlyDispatcher
  currentlyRenderingFiber = null
  currentHook = null;
  workInProgressHook = null;
  renderLanes = NoLanes;
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
  return typeof action == 'function' ? action(state) : action
} 


function dispatchSetState(fiber,queue,action){
  const eventTime = requestEventTime()
  const lane = requestUpdateLane(fiber)
  const update:any = {
    lane,
    action,
    eagerReducer : null,
    eagerState : null,
    next:null
  }

  if(isRenderPhaseUpdate(fiber)){
    enqueueRenderPhaseUpdate(queue, update);
  }else{

    const alternate = fiber.alternate;


    if(fiber.lanes == NoLanes && (alternate == null || alternate.lanes == NoLanes) ){
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

  }



  const root = enqueueConcurrentHookUpdate(fiber,queue,update,lane)


  scheduleUpdateOnFiber(fiber,lane,eventTime)
  entangleTransitionUpdate(root,queue,lane)
}

function entangleTransitionUpdate(root,queue,lane){
  if(isTransitionLane(lane)){
    let queueLanes = queue.lanes;
    queueLanes  = intersectLanes(queueLanes, root.pendingLanes)
    const newQueueLanes = mergeLanes(queueLanes, lane);
    queue.lanes = newQueueLanes;

  }
}

function isRenderPhaseUpdate(fiber){
  const alternate = fiber.alternate;
  return (
    fiber == currentlyRenderingFiber || (alternate != null && alternate == currentlyRenderingFiber)
  )
}

function enqueueRenderPhaseUpdate(queue,update){
  // didScheduleRenderPhaseUpdateDuringThisPass = didScheduleRenderPhaseUpdate = true;
  const pending = queue.pending
  if(pending == null){
    update.next = update
  }else {
    update.next = pending.next
    pending.next = update
  }
  queue.pending = update;
}


export function bailoutHooks(current,workInProgress,lanes){
  if((workInProgress.mode & StrictEffectsMode) != NoMode){
    
    console.error('bailoutHooks')
  }else{
    workInProgress.flags &= ~(UpdateEffect | PassiveEffect)
  }
  current.lanes = removeLanes(current.lanes, lanes)
}