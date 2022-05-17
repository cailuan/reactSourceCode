import { reconcileChildFibers,mountChildFibers } from "./ReactChildFiber";
import { pushHostContainer } from "./ReactFiberHostContext";
import { NoLanes } from "./ReactFiberLane";
import { cloneUpdateQueue,processUpdateQueue } from "./ReactUpdateQueue";
import { Fragment, FunctionComponent, HostComponent, HostRoot, HostText, IndeterminateComponent } from "./ReactWorkTags";
import {shouldSetTextContent} from './ReactFiberHostConfig'
import { PerformedWork } from "./ReactFiberFlags";
import { renderWithHooks } from "./ReactFiberHooks";
import { prepareToReadContext } from "./ReactFiberNewContext";

export function beginWork(current, workInProgress, renderLanes){

  workInProgress.lanes = NoLanes

  switch(workInProgress.tag){
    case IndeterminateComponent:
      return mountIndeterminateComponent(current,workInProgress,workInProgress.type,renderLanes)
    case HostRoot:
      return updateHostRoot(current, workInProgress, renderLanes)
    case HostText:
      return updateHostText(current, workInProgress)
    case HostComponent:
      return updateHostComponent(current, workInProgress, renderLanes)
    case Fragment:
      return updateFrament(current, workInProgress, renderLanes)

  }
}

function mountIndeterminateComponent(_current,workInProgress,Component,renderLanes){
  const props = workInProgress.pendingProps;
  prepareToReadContext(workInProgress, renderLanes)
  const value =  renderWithHooks(null,workInProgress,Component,props,{},renderLanes)
  
  workInProgress.flags |= PerformedWork

  if(typeof value.render === 'function'){
    // todo
  }else{
    workInProgress.tag = FunctionComponent
    reconcileChildren(null,workInProgress,value,renderLanes)
  }
  return workInProgress.child
}

function updateFrament(current, workInProgress, renderLanes){
  const nextChildren =  workInProgress.pendingProps
  reconcileChildren(current,workInProgress,nextChildren,renderLanes)
  return workInProgress.child
} 

function updateHostRoot(current, workInProgress, renderLanes){
  pushHostRootContext(workInProgress)
  cloneUpdateQueue(current,workInProgress)
  processUpdateQueue(workInProgress,null,null,renderLanes)
  const nextState = workInProgress.memoizedState
  const root = workInProgress.stateNode
  const nextChildren = nextState.element

  reconcileChildren(current,workInProgress,nextChildren,renderLanes)
  return workInProgress.child
}

function updateHostText(current, workInProgress){
  if(current === null){
    // tryToClaimNextHydratableInstance(workInProgress);
  }
  return null
}

function updateHostComponent(current,workInProgress ,renderLanes ){
  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;

  const prevProps = current != null ? current.memoizedProps : null;
  let nextChildren = nextProps.children;
  const isDirectTextChild = shouldSetTextContent(type,nextProps)
  if(isDirectTextChild){
    nextChildren = null;
  }
  reconcileChildren(current,workInProgress,nextChildren,renderLanes)
  return workInProgress.child;
}

export function reconcileChildren(current,workInProgress,nextChildren,renderLanes){
  if(current == null){
    workInProgress.child = mountChildFibers(workInProgress,null,nextChildren,renderLanes)
  }else{
    workInProgress.child = reconcileChildFibers(workInProgress,current.child,nextChildren,renderLanes)

  }
}


function pushHostRootContext(workInProgress){

  const root = workInProgress.stateNode
  pushHostContainer(workInProgress,root.containerInfo)
}