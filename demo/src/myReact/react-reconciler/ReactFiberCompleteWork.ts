import { createTextInstance ,createInstance,finalizeInitialChildren, appendInitialChild} from "../react-dom/client/ReactDOMHostConfig";
import { getRootHostContainer } from "./ReactFiberHostContext";
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags";

const appendAllChildren = function(parent,workInProgress,needsVisibilityToggle,isHidden){
  let node = workInProgress.child;
  while(node != null){
    if(node.tag === HostComponent || node.tag === HostText){
      appendInitialChild(parent,node.stateNode)
    }

    while (node.sibling == null) {
      if(node.return == null || node.return  == workInProgress){
        return
      }
      node = node.return;
    }
  }
}

export function completeWork(current,workInProgress,renderLanes){
  const newProps = workInProgress.pendingProps;
  const _rootContainerInstance = getRootHostContainer()
  switch(workInProgress.tag){
    case HostText:
      const newText = newProps;
      workInProgress.stateNode = createTextInstance(newText,_rootContainerInstance,{},workInProgress)
      bubbleProperties(workInProgress)
      return null
    case HostRoot:
      const fiberRoot = workInProgress.stateNode
      break
    case HostComponent:
      
      const type = workInProgress.type
      const instance = createInstance(type,newProps,_rootContainerInstance,{},workInProgress)
      appendAllChildren(instance, workInProgress, false, false)
      workInProgress.stateNode = instance
      finalizeInitialChildren(instance,type,newProps,_rootContainerInstance)
      return null
  }
}

function bubbleProperties(workInProgress){
  return null
}