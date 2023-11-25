import { reconcileChildFibers,mountChildFibers, cloneChildFibers } from "./ReactChildFiber";
import { pushHostContainer } from "./ReactFiberHostContext";
import { includesSomeLane, NoLanes } from "./ReactFiberLane";
import { cloneUpdateQueue,processUpdateQueue } from "./ReactUpdateQueue";
import { ClassComponent, ContextProvider, ForwardRef, Fragment, FunctionComponent, HostComponent, HostRoot, HostText, IndeterminateComponent } from "./ReactWorkTags";
import {shouldSetTextContent} from './ReactFiberHostConfig'
import { PerformedWork, Ref , RefStatic} from "./ReactFiberFlags";
import { renderWithHooks ,bailoutHooks} from "./ReactFiberHooks";
import { prepareToReadContext, pushProvider } from "./ReactFiberNewContext";
import {constructClassInstance, mountClassInstance} from "./ReactFiberClassComponent"

let didReceiveUpdate = false
let hasWarnedAboutUsingNoValuePropOnContextProvider = false

export function markWorkInProgressReceivedUpdate() {
  didReceiveUpdate = true;
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
      return bailoutOnAlreadyFinishedWork(current, workInProgress, renderLanes)
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
    };
    case ClassComponent: {
      
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps = unresolvedProps;
      return updateClassComponent(
        current,
        workInProgress,
        Component,
        resolvedProps,
        renderLanes,
      );
      
    };
     
    case ContextProvider:
      return updateContextProvider(current, workInProgress ,renderLanes)

    case ForwardRef:{
      const type = workInProgress.type
      const unresolvedProps = workInProgress.pendingProps;
      const resolvedProps =
        workInProgress.elementType === type
          ? unresolvedProps
          : {} //resolveDefaultProps(type, unresolvedProps)
      return updateForwardRef(
        current,
        workInProgress,
        type,
        resolvedProps,
        renderLanes,)
    }
      


  }
}

function updateClassComponent(
  current,
  workInProgress,
  Component,
  nextProps,
  renderLanes
){
  if(workInProgress.type != workInProgress.elementType ){
    const innerPropTypes = Component.propTypes;

  }

  let hasContext = false;
  const instance = workInProgress.stateNode;

  let shouldUpdate;
  if(instance == null){
    constructClassInstance(workInProgress, Component, nextProps);
    mountClassInstance(workInProgress, Component, nextProps, renderLanes);
    

  }  

  const nextUnitOfWork = finishClassComponent(
    current,
    workInProgress,
    Component,
    shouldUpdate,
    hasContext,
    renderLanes,
  );

  return nextUnitOfWork;
}

function finishClassComponent(current,workInProgress, Component, shouldUpdate, hasContext, renderLanes) {
  markRef(current, workInProgress);
  const instance = workInProgress.stateNode;

  let nextChildren;
  nextChildren = instance.render();

  workInProgress.flags |= PerformedWork;
  reconcileChildren(current, workInProgress, nextChildren, renderLanes);


  workInProgress.memoizedState = instance.state;

  return workInProgress.child;
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