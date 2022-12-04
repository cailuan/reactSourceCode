import { reconcileChildFibers,mountChildFibers, cloneChildFibers } from "./ReactChildFiber";
import { pushHostContainer } from "./ReactFiberHostContext";
import { includesSomeLane, NoLanes } from "./ReactFiberLane";
import { cloneUpdateQueue,processUpdateQueue } from "./ReactUpdateQueue";
import { ContextProvider, ForwardRef, Fragment, FunctionComponent, HostComponent, HostPortal, HostRoot, HostText, IndeterminateComponent, MemoComponent, SimpleMemoComponent } from "./ReactWorkTags";
import {shouldSetTextContent} from './ReactFiberHostConfig'
import { PerformedWork, Ref , RefStatic} from "./ReactFiberFlags";
import { renderWithHooks ,bailoutHooks} from "./ReactFiberHooks";
import { prepareToReadContext, pushProvider } from "./ReactFiberNewContext";
import { createFiberFromElement, createFiberFromTypeAndProps, createWorkInProgress, isSimpleFunctionComponent } from "./ReactFiber";
import shallowEqual from "../shared/shallowEqual";

let didReceiveUpdate = false
let hasWarnedAboutUsingNoValuePropOnContextProvider = false

export function markWorkInProgressReceivedUpdate() {
  didReceiveUpdate = true;
}

function attemptEarlyBailoutIfNoScheduledUpdate(current,workInProgress,renderLanes){
  // switch(workInProgress.tag){
  //   case HostRoot:

  // }
  return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
}

function bailoutOnAlreadyFinishedWork(current,workInProgress,renderLanes){
  if(!includesSomeLane(renderLanes,workInProgress.childLanes)){
    return
  }

  cloneChildFibers(current,workInProgress)

  return workInProgress.child;
}

function markRef(current,workInProgress){
  const ref = workInProgress.ref;
  
  if((current == null  && ref != null) || (current != null && current.ref != ref )){
    workInProgress.flags |= Ref
    workInProgress.flags |= RefStatic
  }

}

function updateForwardRef(current,workInProgress,Component,nextProps,renderLanes){
  const render = Component.render;
  const ref = workInProgress.ref;
  prepareToReadContext(workInProgress,renderLanes)
  let nextChildren;
  nextChildren = renderWithHooks(current,workInProgress,render,nextProps,ref,renderLanes)
  workInProgress.flags |= PerformedWork
  reconcileChildren(current,workInProgress,nextChildren,renderLanes)
  return workInProgress.child
}

function updateContextProvider(current, workInProgress, renderLanes){
  const providerType = workInProgress.type
  const context =  providerType._context
  const newProps = workInProgress.pendingProps;
  const oldProps = workInProgress.memoizedProps;
  const newValue = newProps.value;

  if(!('value' in newProps)){
    if(!hasWarnedAboutUsingNoValuePropOnContextProvider){
      hasWarnedAboutUsingNoValuePropOnContextProvider = true
      console.error('The `value` prop is required for the `<Context.Provider>`. Did you misspell it or forget to pass it?',)

    }
   
  }
  const providerPropTypes = workInProgress.type.propTypes;
  if(providerPropTypes){
    debugger
  }
  pushProvider(workInProgress, context, newValue)
  

  if(oldProps != null){
    debugger
  }
  const newChildren = newProps.children
  reconcileChildren(current, workInProgress, newChildren, renderLanes)
  return workInProgress.child
}

export function beginWork(current, workInProgress, renderLanes){
  let updateLanes = workInProgress.lanes;
 

  if(current != null){
    const oldProps = current.memoizedProps;
    const newProps = workInProgress.pendingProps;
    if(oldProps != newProps ){
      didReceiveUpdate = true
    }else if(!includesSomeLane(renderLanes, updateLanes)){
      didReceiveUpdate = false
      switch(workInProgress.tag){
        case HostRoot:
          break
      }
      return attemptEarlyBailoutIfNoScheduledUpdate(current, workInProgress, renderLanes)
    }else{
      didReceiveUpdate = false
    }
  }else{
    didReceiveUpdate = false;
  }


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
    case FunctionComponent:{
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType == Component
          ? unresolvedProps
          : {} // resolveDefaultProps(Component, unresolvedProps);
      return updateFunctionComponent(current,workInProgress,Component,resolvedProps,renderLanes)
    }
    case HostPortal:
      return updatePortalComponent(current, workInProgress, renderLanes);
    
     
    case ContextProvider:
      return updateContextProvider(current, workInProgress ,renderLanes)

    case ForwardRef:{
      const type = workInProgress.type
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType == type
          ? unresolvedProps
          : {} //resolveDefaultProps(type, unresolvedProps)
      return updateForwardRef(
        current,
        workInProgress,
        type,
        resolvedProps,
        renderLanes,)
    }

    case MemoComponent:{
      const type = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      // let resolvedProps = resolveDefaultProps(type, unresolvedProps);
      if (workInProgress.type != workInProgress.elementType) {
        const outerPropTypes = type.propTypes;

      }

      return updateMemoComponent(current,workInProgress,type,unresolvedProps,renderLanes)
    }
      


  }
}

function updateMemoComponent(current,workInProgress,Component,nextProps,renderLanes){
  if (current == null) {
    const type = Component.type;
    if(isSimpleFunctionComponent(type) && Component.compare == null && Component.defaultProps == undefined){
      let resolvedType = type;
      workInProgress.tag = SimpleMemoComponent
      workInProgress.type = type
      return updateSimpleMemoComponent( 
        current,
        workInProgress,
        resolvedType,
        nextProps,
        renderLanes,)
    }

    const child =  createFiberFromTypeAndProps(Component.type,null,nextProps, workInProgress,workInProgress.mode,renderLanes)

    child.ref = workInProgress.ref;
    child.return = workInProgress;
    workInProgress.child = child;
    return child;


  }

  const type = Component.type;
  const innerPropTypes = type.propTypes;

  const currentChild = current.child


  const hasScheduledUpdateOrContext = checkScheduledUpdateOrContext(current,renderLanes)

  if (!hasScheduledUpdateOrContext) {
    const prevProps = currentChild.memoizedProps;

    let compare = Component.compare;

    compare = compare !== null ? compare : shallowEqual;
    if (compare(prevProps, nextProps) && current.ref === workInProgress.ref) {
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes);
    }
  }
  workInProgress.flags |= PerformedWork;
  const newChild = createWorkInProgress(currentChild, nextProps);
  newChild.ref = workInProgress.ref;
  newChild.return = workInProgress;
  workInProgress.child = newChild;
  return newChild;



}

function checkScheduledUpdateOrContext(current,renderLanes){
  const updateLanes = current.lanes;
  if (includesSomeLane(updateLanes, renderLanes)) {
    return true;
  }

  return false;
}

function updateSimpleMemoComponent(current,workInProgress,Component,nextProps,renderLanes){
  if(current != null){
    const prevProps = current.memoizedProps;
    if(  shallowEqual(prevProps, nextProps) && current.ref == workInProgress.ref){
      didReceiveUpdate = false;
      workInProgress.pendingProps = nextProps = prevProps;

      workInProgress.lanes = current.lanes;

      return bailoutOnAlreadyFinishedWork(
        current,
        workInProgress,
        renderLanes,
      );
    }
   
  
  }

  return updateFunctionComponent(
    current,
    workInProgress,
    Component,
    nextProps,
    renderLanes,
  );
}

function mountIndeterminateComponent(_current,workInProgress,Component,renderLanes){
  const props = workInProgress.pendingProps;
  prepareToReadContext(workInProgress, renderLanes)
  const value =  renderWithHooks(null,workInProgress,Component,props,{},renderLanes)
  
  workInProgress.flags |= PerformedWork

  if(typeof value.render == 'function'){
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
  if(current == null){
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
  markRef(current,workInProgress)
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

function updateFunctionComponent(current,workInProgress,Component,nextProps,renderLanes){
  let nextChildren 
  nextChildren = renderWithHooks(current,workInProgress,Component,nextProps,{},renderLanes)

  if(current != null && !didReceiveUpdate){
    bailoutHooks(current,workInProgress,renderLanes)
    return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
  }

  workInProgress.flags |= PerformedWork

  reconcileChildren(current,workInProgress,nextChildren,renderLanes)
  return workInProgress.child;
}

function updatePortalComponent(current, workInProgress, renderLanes){
  pushHostContainer(workInProgress, workInProgress?.stateNode?.containerInfo)
  const nextChildren = workInProgress.pendingProps;
  if(current == null){
    workInProgress.child =  reconcileChildFibers(workInProgress,null,nextChildren,renderLanes)

  }else{
    reconcileChildren(current,workInProgress,nextChildren,renderLanes)
  }
  return workInProgress.child;
}