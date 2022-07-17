import { scheduleCallback } from "../scheduler/scheduler";
import { NormalPriority as NormalSchedulerPriority } from "../scheduler/SchedulerPriorities";
import { DiscreteEventPriority, getCurrentUpdatePriority, lanesToEventPriority, setCurrentUpdatePriority ,lowerEventPriority,DefaultEventPriority} from "./ReactEventPriorities";
import { createWorkInProgress } from "./ReactFiber";
import {beginWork as originalBeginWork} from './ReactFiberBeginWork'
import { commitMutationEffects, commitBeforeMutationEffects, commitLayoutEffects, commitPassiveUnmountEffects ,commitPassiveMountEffects} from "./ReactFiberCommitWork";
import { completeWork } from "./ReactFiberCompleteWork";
import { NoFlags, PassiveMask } from "./ReactFiberFlags";
import { scheduleMicrotask } from "./ReactFiberHostConfig";
import { markRootUpdated, mergeLanes,markStarvedLanesAsExpired, getHighestPriorityLane, getNextLanes, DefaultLane, NoLanes, SyncLane, markRootFinished, NoLane } from "./ReactFiberLane"
import { scheduleSyncCallback,flushSyncCallbacks } from "./ReactFiberSyncTaskQueue";
import { LegacyRoot } from "./ReactRootTags";
import { ConcurrentMode, NoMode } from "./ReactTypeOfMode";

const RootIncomplete = 0;
const RootFatalErrored = 1;
const RootErrored = 2;
const RootSuspended = 3;
const RootSuspendedWithDelay = 4;
const RootCompleted = 5;

let workInProgressRoot:any = null
let workInProgress:any = null
let workInProgressRootRenderLanes = NoLanes
let workInProgressRootExitStatus = RootIncomplete
let rootWithPendingPassiveEffects:any = null

let rootDoesHavePassiveEffects = false

export let subtreeRenderLanes = NoLanes
let pendingPassiveEffectsLanes = NoLanes

export function requestEventTime(){
  return performance.now()
}


export function requestUpdateLane(fiber){
  const mode = fiber.mode
  if( (mode & ConcurrentMode) === NoMode ){
    return SyncLane
  } 
  const updateLane =  getCurrentUpdatePriority()
  if(updateLane != NoLanes){
    return updateLane
  }

  return DefaultLane
}
  

export function flushPassiveEffects(){
  if(rootWithPendingPassiveEffects !=null){
    const renderPriority = lanesToEventPriority(pendingPassiveEffectsLanes)
    const priority = lowerEventPriority(DefaultEventPriority,renderPriority)
    const previousPriority = getCurrentUpdatePriority()
    try{
      setCurrentUpdatePriority(priority)
      return flushPassiveEffectsImpl()
    }finally{
      setCurrentUpdatePriority(previousPriority)
    }
  }
}

function flushPassiveEffectsImpl(){
  if(rootWithPendingPassiveEffects == null) return false
  const root = rootWithPendingPassiveEffects;
  const lanes = pendingPassiveEffectsLanes;
  rootWithPendingPassiveEffects = null;
  pendingPassiveEffectsLanes = NoLanes
  commitPassiveUnmountEffects(root.current)
  commitPassiveMountEffects(root,root.current)
}


export function scheduleUpdateOnFiber(fiber,lane,eventTime){
  const root =  markUpdateLaneFromFiberToRoot(fiber,lane)
  markRootUpdated(root, lane, eventTime);

  ensureRootIsScheduled(root,eventTime)
}

function markUpdateLaneFromFiberToRoot(fiber,lane){
  fiber.lanes = mergeLanes(fiber.lanes , lane)
  let alternate = fiber.alternate
  if(alternate != null){
    alternate.lanes = mergeLanes(alternate.lanes,lane)
  }
  let node = fiber
  let parent = node.return
  while(parent != null){
    parent.childLanes = mergeLanes(parent.childLanes , lane)
    alternate = parent.alternate
    if(alternate != null){
      alternate.childLanes = mergeLanes(alternate.childLanes , lane)
    }
    node = parent
    parent = node.return
  }
  return node.stateNode
}

function performSyncWorkOnRoot(root){
  const  lanes = getNextLanes(root , NoLanes)
  let exitStatus = renderRootSync(root,lanes)

  const finishedWork = root.current.alternate
  root.finishedWork = finishedWork
  root.finishedLanes = lanes
  commitRoot(root)
}

function ensureRootIsScheduled(root,currentTime){
  const nextLanes = getNextLanes(root ,root == workInProgressRoot ? workInProgressRootRenderLanes : NoLanes )
  let newCallbackNode
  markStarvedLanesAsExpired(root, currentTime)
  const newCallbackPriority = getHighestPriorityLane(nextLanes)
  const existingCallbackPriority = root.callbackPriority;
  if (existingCallbackPriority === newCallbackPriority) {
    return
  }

  var schedulerPriorityLevel
  if(newCallbackPriority == SyncLane){
    if(root.tag == LegacyRoot){

    }else{
      scheduleSyncCallback(performSyncWorkOnRoot.bind(null,root))
    }
    scheduleMicrotask(flushSyncCallbacks)
    newCallbackNode = null
  }else{
    switch(lanesToEventPriority(nextLanes)){
      case DefaultLane:
        schedulerPriorityLevel = NormalSchedulerPriority
        break
    }
    // 添加 taskQueue任务队列 level 初始化为3
     newCallbackNode =  scheduleCallback(schedulerPriorityLevel,performConcurrentWorkOnRoot.bind(null,root))
  }
  
  // root 上添加 performConcurrentWorkOnRoot callback
  root.callbackPriority = newCallbackPriority
  root.callbackNode = newCallbackNode

}


function performConcurrentWorkOnRoot(root,didTimeout){
  // workLoop callback
  var lanes = getNextLanes(root,NoLanes)
  // todo movePendingFibersToMemoized()
  
  const exitStatus =  renderRootSync(root,lanes)

  if(workInProgressRootExitStatus != RootIncomplete){
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;
    root.finishedLanes = lanes;
    finishConcurrentRender(root, exitStatus,lanes)
  }
 

}


function renderRootSync(root,lanes){
  prepareFreshStack(root,lanes)
  debugger
  do{
    workLoopSync()
    break
  }while(true)
  return workInProgressRootExitStatus;
}

function prepareFreshStack(root,lanes){
  workInProgressRoot = root
  workInProgress = createWorkInProgress(root.current,null)
  workInProgressRootRenderLanes = subtreeRenderLanes = lanes

}

function workLoopSync(){
  
  while(workInProgress != null){
    performUnitOfWork(workInProgress)
  }
}

function performUnitOfWork(unitOfWork){
  
  const current = unitOfWork.alternate;
  let next = beginWork(current,unitOfWork,subtreeRenderLanes)

  unitOfWork.memoizedProps = unitOfWork.pendingProps
  if(next == null){
    
    completeUnitOfWork(unitOfWork)
  }else{
    workInProgress = next
  }
}
let beginWork = (current, unitOfWork, lanes)=>{
  return originalBeginWork(current, unitOfWork, lanes)
}

function completeUnitOfWork(unitOfWork){
  let completedWork = unitOfWork;
  do{
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;
    let next = completeWork(current,completedWork,subtreeRenderLanes)

    const siblingFiber = completedWork.sibling;

    if (siblingFiber != null) {
      workInProgress = siblingFiber;
      return;
    }

    completedWork = returnFiber
    workInProgress = completedWork
    
  
  }while(completedWork != null)

  if(workInProgressRootExitStatus === RootIncomplete){
    workInProgressRootExitStatus = RootCompleted
  }
}


function finishConcurrentRender(root, exitStatus, lanes){
  
  switch(exitStatus){
    case RootCompleted:
      commitRoot(root)
      break
  }
}


function commitRoot(root){
  const previousUpdateLanePriority = getCurrentUpdatePriority()
  try{
    setCurrentUpdatePriority(DiscreteEventPriority)
    commitRootImpl(root,previousUpdateLanePriority)
    return null
  }finally{
    setCurrentUpdatePriority(previousUpdateLanePriority)
  }
 
}

function commitRootImpl(root, renderPriorityLevel){
  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes
  root.finishedWork = null
  root.finishedLanes = NoLanes
  root.callbackPriority = NoLane
  
  //todo 任务队列 useEffect 挂载和删除
  if((finishedWork.subtreeFlags & PassiveMask) != NoFlags || (finishedWork.flags & PassiveMask ) != NoFlags ){
    if(!rootDoesHavePassiveEffects) {
      rootDoesHavePassiveEffects = true
      
      scheduleCallback(NormalSchedulerPriority,()=>{
        flushPassiveEffects()
        return null
      })
    }
  }

  markRootFinished(root,0)
  commitBeforeMutationEffects(root, finishedWork)
  commitMutationEffects(root, finishedWork, lanes);
  root.current = finishedWork

  commitLayoutEffects(finishedWork, root, lanes);

  const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;
  if(rootDidHavePassiveEffects){
    rootDoesHavePassiveEffects = false;
    rootWithPendingPassiveEffects = root;
    pendingPassiveEffectsLanes = lanes;
  }
  
  flushSyncCallbacks()
  // onCommitRoot(finishedWork.stateNode, renderPriorityLevel);

}