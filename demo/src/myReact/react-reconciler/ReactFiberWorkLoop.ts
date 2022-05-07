import { scheduleCallback } from "../scheduler/scheduler";
import { NormalPriority } from "../scheduler/SchedulerPriorities";
import { lanesToEventPriority } from "./ReactEventPriorities";
import { createWorkInProgress } from "./ReactFiber";
import {beginWork as originalBeginWork} from './ReactFiberBeginWork'
import { commitMutationEffects } from "./ReactFiberCommitWork";
import { completeWork } from "./ReactFiberCompleteWork";
import { markRootUpdated, mergeLanes,markStarvedLanesAsExpired, getHighestPriorityLane, getNextLanes, DefaultLane, NoLanes, SyncLane } from "./ReactFiberLane"
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


export let subtreeRenderLanes = NoLanes

export function requestEventTime(){
  return performance.now()
}


export function requestUpdateLane(fiber){
  const mode = fiber.mode
  if( (mode & ConcurrentMode) === NoMode ){
    return SyncLane
  } 
  return DefaultLane
}
  


export function scheduleUpdateOnFiber(fiber,lane,eventTime){
  const root =  markUpdateLaneFromFiberToRoot(fiber,lane)
  markRootUpdated(root, lane, eventTime);

  ensureRootIsScheduled(root,eventTime)
}

function markUpdateLaneFromFiberToRoot(fiber,lane){
  fiber.lane = mergeLanes(fiber.lane , lane)
  let node = fiber
  let parent = node.return
  while(parent != null){
    node = parent
    parent = node.return
  }
  return node.stateNode
}


function ensureRootIsScheduled(root,currentTime){
  const nextLanes = getNextLanes(root)
  markStarvedLanesAsExpired(root, currentTime)
  var newCallbackPriority = getHighestPriorityLane(nextLanes)

  var schedulerPriorityLevel
  switch(lanesToEventPriority(nextLanes)){
    case DefaultLane:
      schedulerPriorityLevel = NormalPriority
      break
  }
  
  const newCallbackNode =  scheduleCallback(schedulerPriorityLevel,performConcurrentWorkOnRoot.bind(null,root))
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
  commitRootImpl(root,0)
  return null
}

function commitRootImpl(root, renderPriorityLevel){
  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes
  root.finishedWork = null
  root.finishedLanes = NoLanes
  commitMutationEffects(root, finishedWork, lanes);
  root.current = finishedWork
  // commitLayoutEffects(finishedWork, root, lanes);
  // onCommitRoot(finishedWork.stateNode, renderPriorityLevel);

}