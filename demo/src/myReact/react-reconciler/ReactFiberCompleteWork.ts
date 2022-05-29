import { createTextInstance ,createInstance,finalizeInitialChildren, appendInitialChild, prepareUpdate} from "../react-dom/client/ReactDOMHostConfig";
import { Ref, RefStatic, Update } from "./ReactFiberFlags";
import { getRootHostContainer } from "./ReactFiberHostContext";
import { NoLanes } from "./ReactFiberLane";
import { ProfileMode } from "./ReactTypeOfMode";
import { Fragment, FunctionComponent, HostComponent, HostRoot, HostText } from "./ReactWorkTags";

function markRef(workInProgress){
  workInProgress.flags |= Ref
  workInProgress.flags |= RefStatic
}

function markUpdate(workInProgress){
  workInProgress.flags |= Update
}

let updateHostComponent = function(current,workInProgress,type,newProps,rootContainerInstance){
  const oldProps = current.memoizedProps;
  if(oldProps === newProps){
    return
  }
  const instance = workInProgress.stateNode
  const updatePayload = prepareUpdate(instance,type,oldProps,newProps,rootContainerInstance,{})
  workInProgress.updateQueue = updatePayload
  if(updatePayload){
    markUpdate(workInProgress)
  }
}

const appendAllChildren = function(parent,workInProgress,needsVisibilityToggle,isHidden){
  let node = workInProgress.child;
  while(node != null){
    if(node.tag === HostComponent || node.tag === HostText){
      appendInitialChild(parent,node.stateNode)
    }else if(node.child != null){
      node.child.return = node
      node = node.child
      continue
    }

    while (node.sibling == null) {
      if(node.return == null || node.return  == workInProgress){
        return
      }
      node = node.return;
    }
    node = node.sibling
  }
}

export function completeWork(current,workInProgress,renderLanes){
  const newProps = workInProgress.pendingProps;
  const _rootContainerInstance = getRootHostContainer()
  switch(workInProgress.tag){
    case FunctionComponent:
      bubbleProperties(workInProgress)
      return null
    case Fragment:
      bubbleProperties(workInProgress)
      return null
    case HostText:
      const newText = newProps;
      workInProgress.stateNode = createTextInstance(newText,_rootContainerInstance,{},workInProgress)
      bubbleProperties(workInProgress)
      return null
    case HostRoot:
      const fiberRoot = workInProgress.stateNode
      bubbleProperties(workInProgress)
      break
    case HostComponent:
      const rootContainerInstance = getRootHostContainer();
      const type = workInProgress.type;
      if(current != null && workInProgress.stateNode != null){

        updateHostComponent(current,workInProgress,type,newProps,rootContainerInstance)
      }else{
        const instance = createInstance(type,newProps,_rootContainerInstance,{},workInProgress)
        appendAllChildren(instance, workInProgress, false, false)
        workInProgress.stateNode = instance
        finalizeInitialChildren(instance,type,newProps,_rootContainerInstance)


        if (workInProgress.ref !== null) {
          markRef(workInProgress)
        }
      }
      

      bubbleProperties(workInProgress)
      return null
  }
}

function bubbleProperties(completedWork){
  const didBailout = completedWork.alternate != null && completedWork.alternate.child  == completedWork.child
  let subtreeFlags:any = NoLanes
  if(!didBailout){
    if((completedWork.mode & ProfileMode) !== NoLanes ){
      let child = completedWork.child
      while(child != null){
        subtreeFlags |= child.subtreeFlags
        subtreeFlags |= child.flags
        child = child.sibling
      }
    }

    completedWork.subtreeFlags |= subtreeFlags
  }else{
    if((completedWork.mode & ProfileMode ) != NoLanes){
      let child = completedWork.child;
      while(child != null){
        
      }
    }
    completedWork.subtreeFlags |= subtreeFlags
  }
  return didBailout
}