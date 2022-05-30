import { appendChildToContainer, commitTextUpdate, commitUpdate } from "../react-dom/client/ReactDOMHostConfig"
import { MutationMask, NoFlags, Placement, Update,LayoutMask, Callback, Ref } from "./ReactFiberFlags"
import { NoLane, NoLanes } from "./ReactFiberLane"
import { HostComponent, HostRoot, HostText } from "./ReactWorkTags"

let nextEffect:any = null
let inProgressLanes = null

export function commitMutationEffects(root,firstChild,committedLanes){
  nextEffect = firstChild
  inProgressLanes = committedLanes
  commitMutationEffects_begin(root)
  nextEffect = null
  inProgressLanes = null
}

function commitMutationEffects_begin(root){

  while(nextEffect != null){
    let fiber = nextEffect;
    const child = fiber.child;
    // todo subtreeFlags (fiber.subtreeFlags & MutationMask) !== NoFlags  满足该条件
    if(child != null && ((MutationMask & fiber.subtreeFlags) !== NoFlags) ){
      nextEffect = child;
    }else{
      commitMutationEffects_complete(root)
    }
  }
}

function commitMutationEffects_complete(root){
  while(nextEffect != null){
    const fiber = nextEffect;
    commitMutationEffectsOnFiber(fiber,root)
    const sibling = fiber.sibling;
    if (sibling !== null) {
      nextEffect = sibling;
      return;
    }
    nextEffect = fiber.return;
  }
}

function commitMutationEffectsOnFiber(finishedWork,root){
  console.log(finishedWork,"finishedWork")
  const flags = finishedWork.flags;
  const primaryFlags = flags & (Placement | Update)
  switch(primaryFlags){
    case Placement:
      commitPlacement(finishedWork)
      finishedWork.flags &= ~Placement;
      break;
    case Update:
      const current = finishedWork.alternate;
      commitWork(current,finishedWork)
      break
  }
}

function getHostParentFiber(fiber){
  let parent = fiber.return;
  return parent
}

export function commitPlacement(finishedWork){
  const parentFiber = getHostParentFiber(finishedWork);
  let parent;
  let isContainer;
  const parentStateNode = parentFiber.stateNode;
  switch(parentFiber.tag){
    case HostRoot:
      parent = parentStateNode.containerInfo;
      isContainer = true;
      break
  }

  if(isContainer){
    insertOrAppendPlacementNodeIntoContainer(finishedWork,null,parent)
  }
}

function insertOrAppendPlacementNodeIntoContainer(node,before,parent){
  const {tag} = node;
  const isHost = tag === HostText || tag === HostComponent
  if(isHost){
    const stateNode = node.stateNode;
    if(before){
      //todo
    }else{
      appendChildToContainer(parent, stateNode);
    }
  }else{
    const child = node.child
    if(child != null){
      insertOrAppendPlacementNodeIntoContainer(child,before,parent)
      //todo
    }
  }
}



export function commitBeforeMutationEffects(root,firstChild){

}


export function commitWork(current,finishedWork){
  switch(finishedWork.tag){
    case HostText:
      const textInstance = finishedWork.stateNode;
    const newText = finishedWork.memoizedProps;
      const oldText = current != null ? current.memoizedProps : newText
      commitTextUpdate(textInstance,oldText,newText)
      
      return
    case HostComponent:
      const instance = finishedWork.stateNode;
      if(instance != null){
        const newProps = finishedWork.memoizedProps;
        const oldProps = current !== null ? current.memoizedProps : newProps;
        const type = finishedWork.type;
        const updatePayload = finishedWork.updateQueue
        finishedWork.updateQueue = null;
        if(updatePayload != null){
          
          commitUpdate(
            instance,
            updatePayload,
            type,
            oldProps,
            newProps,
            finishedWork
          )
          
        }
      }
      return
  }
}


export function commitLayoutEffects(finishedWork,root,committedLanes){
  nextEffect = finishedWork;
  commitLayoutEffects_begin(finishedWork, root, committedLanes)
}

function commitLayoutEffects_begin(subtreeRoot,root,committedLanes){
  while (nextEffect != null) {
    const fiber = nextEffect;
    const firstChild = fiber.child;
    if((fiber.subtreeFlags & LayoutMask) != NoFlags && firstChild != null){
      nextEffect = firstChild;
    }else{
      commitLayoutMountEffects_complete(subtreeRoot,root,committedLanes)
    }
  }
}

function commitLayoutMountEffects_complete(subtreeRoot,root,committedLanes){
  while(nextEffect != null){
    const fiber = nextEffect;
    if((fiber.flags & LayoutMask) != NoFlags){
      const current = fiber.alternate;
      commitLayoutEffectOnFiber(root, current, fiber, committedLanes)
    }
    nextEffect = fiber.return;
  }
  
}

function commitLayoutEffectOnFiber(finishedRoot,current,finishedWork,committedLanes){
  if((finishedWork.flags & (Update | Callback))!=NoLane){
    switch(finishedWork.tag){
      case HostComponent:
        const instance = finishedWork.stateNode
        if(current == null && finishedWork.flags & Update){
          const type = finishedWork.type;
          const props = finishedWork.memoizedProps;
          debugger
          // commitMount(instance, type, props, finishedWork);
        }
    }
  }

  if(finishedWork.flags & Ref){
    commitAttachRef(finishedWork)
  }
}

function commitAttachRef(finishedWork){
  debugger
  const ref = finishedWork.ref;
  if (ref !== null) {
    const instance = finishedWork.stateNode;
    if(typeof ref == 'function'){

    }else{
      ref.current = instance
    }
  }
}