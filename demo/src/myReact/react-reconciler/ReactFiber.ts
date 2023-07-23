import { REACT_CONTEXT_TYPE, REACT_ELEMENT_TYPE, REACT_FORWARD_REF_TYPE, REACT_FRAGMENT_TYPE, REACT_LAZY_TYPE, REACT_MEMO_TYPE, REACT_OFFSCREEN_TYPE, REACT_PROVIDER_TYPE, REACT_SUSPENSE_TYPE } from "../shared/ReactSymbols";
import { NoFlags, StaticMask } from "./ReactFiberFlags";
import { NoLanes } from "./ReactFiberLane";
import {resolveForwardRefForHotReloading} from './ReactFiberHotReloading'
import { Fragment, HostComponent, HostRoot, HostText, IndeterminateComponent, ContextProvider, ContextConsumer, ForwardRef, MemoComponent, HostPortal,SuspenseComponent, OffscreenComponent, LazyComponent, ClassComponent, FunctionComponent } from "./ReactWorkTags"


export function createFiberFromPortal(portal, mode, lanes){
  const pendingProps = portal.children !== null ? portal.children : [];
  const fiber = createFiber(HostPortal, pendingProps, portal.key, mode);
  fiber.lanes = lanes;
  fiber.stateNode = {
    containerInfo: portal.containerInfo,
    pendingChildren: null, // Used by persistent updates
    implementation: portal.implementation,
  };
  return fiber;
}

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
  this.lanes =  NoLanes;
  this.pendingLanes = NoLanes
  this.flags = NoFlags
  this.subtreeFlags = NoFlags
  this.childLanes = NoLanes

  this.memoizedProps = null;
  this.updateQueue = null;
  this.memoizedState = null;
  this.dependencies = null;
}


export function createWorkInProgress(current,pendingProps){
  let workInProgress = current.alternate;
  if(workInProgress == null || workInProgress == undefined){
    workInProgress = createFiber(current.tag,pendingProps,current.key,current.mode)
    workInProgress.elementType = current.elementType;
    workInProgress.type = current.type;
    workInProgress.stateNode = current.stateNode;
    workInProgress.alternate = current;
    current.alternate = workInProgress;
  }else{
    workInProgress.pendingProps = pendingProps;
    workInProgress.type = current.type;
    workInProgress.flags = NoFlags;
    workInProgress.subtreeFlags = NoFlags;
    workInProgress.deletions = null;

  }
  workInProgress.flags = current.flags & StaticMask // & StaticMask
  workInProgress.childLanes = current.childLanes
  workInProgress.lanes = current.lanes;
  workInProgress.child = current.child;
  workInProgress.memoizedState = current.memoizedState;
  workInProgress.updateQueue = current.updateQueue;
  workInProgress.ref = current.ref
  workInProgress.index = current.index
  workInProgress.sibling = current.sibling

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

export function createFiberFromSuspense(pendingProps,mode, lanes,key){
  const fiber = createFiber(SuspenseComponent, pendingProps, key , mode);
  fiber.elementType = REACT_SUSPENSE_TYPE;
  fiber.lanes = lanes;
  return fiber;
}


export function createFiberFromTypeAndProps(type,key,pendingProps,owner,mode,lanes){
  let fiberTag = IndeterminateComponent
  let resolvedType = type
  if(typeof type == 'function'){
    if(shouldConstruct(type)){
      // react class
    }else{
      
    }
  }else if(typeof type == 'string'){
    fiberTag = HostComponent
  }else {
    getTag:switch(type){
      case REACT_FRAGMENT_TYPE:
        return createFiberFromFragment(pendingProps.children,mode,lanes,key)
      case REACT_SUSPENSE_TYPE:
        return createFiberFromSuspense(pendingProps, mode, lanes, key)
      default :
        if(typeof type== 'object' && type != null){
          switch(type.$$typeof){
            case REACT_PROVIDER_TYPE:
              fiberTag = ContextProvider;
              break getTag
            case REACT_CONTEXT_TYPE : 
              fiberTag = ContextConsumer;
              resolvedType = resolveForwardRefForHotReloading(resolvedType)
              break getTag;
            case REACT_FORWARD_REF_TYPE:
            
              fiberTag = ForwardRef
              resolvedType = resolveForwardRefForHotReloading(resolvedType)
              break getTag;
            case REACT_MEMO_TYPE:
              fiberTag = MemoComponent
              break getTag;
            case REACT_LAZY_TYPE:
              fiberTag = LazyComponent;
              resolvedType = null;
              break getTag;
            
          }
        }
    }
  }
  const fiber = createFiber(fiberTag,pendingProps,key,mode)
  fiber.elementType = type
  fiber.type = resolvedType
  fiber.lanes = lanes
  return fiber
}


export function createFiberFromFragment(elements,mode,lanes,key){
  const fiber =  createFiber(Fragment,elements,key,mode)
  fiber.lanes = lanes
  return fiber
}

function shouldConstruct(Component){
  const prototype = Component.prototype
  return !!(prototype && prototype.isReactComponent)
}

export function isSimpleFunctionComponent(type: any) {
  return (
    typeof type == 'function' &&
    !shouldConstruct(type) &&
    type.defaultProps == undefined
  );
}


export function createFiberFromOffscreen(pendingProps,mode,lanes,key){
  const fiber = createFiber(OffscreenComponent,pendingProps,key,mode);
  fiber.elementType = REACT_OFFSCREEN_TYPE;
  fiber.lanes = lanes;
  const primaryChildInstance =  {
    isHidden: false,
    pendingMarkers: null,
    retryCache: null,
    transitions: null,
  }
  fiber.stateNode = primaryChildInstance;
  return fiber;
}



export function resolveLazyComponentTag(Component){
  if(typeof Component == 'function'){
    return shouldConstruct(Component) ? ClassComponent : FunctionComponent;
  }

  return IndeterminateComponent;
}