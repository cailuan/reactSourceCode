import { NoFlags } from "./ReactFiberFlags";
import { NoLanes } from "./ReactFiberLane";
import { HostComponent, HostRoot, HostText, IndeterminateComponent } from "./ReactWorkTags"

export function createHostRootFiber(){

  return createFiber(HostRoot,null,null,3)
}


function createFiber(tag,pendingProps,key,mode:any){
  return new FiberNode(tag,pendingProps,key,mode)
}

function FiberNode(tag,pendingProps,key,mode){
  this.tag = tag;
  this.key = key;
  this.mode = mode;
  this.pendingProps = pendingProps;
  this.lane =  NoLanes;
  this.pendingLanes = NoLanes
  this.flags = NoFlags
  this.subtreeFlags = NoFlags
}


export function createWorkInProgress(current,pendingProps){
  let workInProgress = current.alternate;
  if(workInProgress === null || workInProgress === undefined){
    workInProgress = createFiber(current.tag,pendingProps,current.key,current.mode)
    workInProgress.stateNode = current.stateNode
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  }

  workInProgress.lanes = current.lanes;
  workInProgress.child = current.child;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;

  return workInProgress
  

}

export function createFiberFromText(content,mode,lanes){
  const fiber = createFiber(HostText,content,null,mode)
  fiber.lanes = lanes;
  return fiber;
}


export function createFiberFromElement(element,mode,lanes){
  const type = element.type
  const key = element.key
  const pendingProps = element.props
  const owner = element.owner
  const fiber = createFiberFromTypeAndProps(type,key,pendingProps,owner,mode,lanes)
  return fiber
} 


export function createFiberFromTypeAndProps(type,key,pendingProps,owner,mode,lanes){
  let fiberTag = IndeterminateComponent
  let resolvedType = type
  if(typeof type === 'string'){
    fiberTag = HostComponent
  }
  const fiber = createFiber(fiberTag,pendingProps,key,mode)
  fiber.elementType = type
  fiber.type = resolvedType
  fiber.lanes = lanes
  return fiber
}
