import { appendChildToContainer, commitTextUpdate, commitUpdate } from "../react-dom/client/ReactDOMHostConfig"
import { MutationMask, NoFlags, Placement, Update,LayoutMask, Callback, Ref, PassiveMask,Passive } from "./ReactFiberFlags"
import { NoLane, NoLanes } from "./ReactFiberLane"
import { Passive as HookPassive , HasEffect as HookHasEffect } from "./ReactHookEffectTags"
import { ProfileMode } from "./ReactTypeOfMode"
import { FunctionComponent, HostComponent, HostRoot, HostText } from "./ReactWorkTags"

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
  if (ref != null) {
    const instance = finishedWork.stateNode;
    if(typeof ref == 'function'){

    }else{
      ref.current = instance
    }
  }
}

export function commitPassiveUnmountEffects(firstChild){
  nextEffect = firstChild;
  commitPassiveUnmountEffects_begin()
}

function commitPassiveUnmountEffects_begin(){
  while(nextEffect != null){
    const fiber = nextEffect;
    const child = fiber.child
    if((child.subtreeFlags & PassiveMask) != NoLanes && child != null){
      nextEffect = child
    }else{
      commitPassiveUnmountEffects_complete()
    }
  }
}

function commitPassiveUnmountEffects_complete(){
  while(nextEffect != null){
    const fiber = nextEffect
    if((fiber.flags & Passive) != NoFlags){
      commitPassiveUnmountOnFiber(fiber)
    }
    const sibling = fiber.sibling;
    if(sibling != null){
      nextEffect = sibling;
      return;
    }
    nextEffect = fiber.return;
  }
}

function commitPassiveUnmountOnFiber(finishedWork){
  switch(finishedWork.tag){
    case FunctionComponent:
      commitHookEffectListUnmount(HookPassive |HookHasEffect , finishedWork, finishedWork.return )
      break;
  }
}

function commitHookEffectListUnmount(flags,finishedWork,nearestMountedAncestor){
  const updateQueue = finishedWork.updateQueue
  const lastEffect = updateQueue != null ? updateQueue.lastEffect : null
  if(lastEffect != null){
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do{
      if((effect.tag & flags) === flags){
        const destroy = effect.destroy;
        effect.destroy = undefined;
        if(destroy != undefined){
          debugger
          // safelyCallDestroy(finishedWork,nearestMountedAncestor,destroy)
        }
      }
      effect = effect.next;
    }while(effect != firstEffect)
  }
}


export function commitPassiveMountEffects(root,finishedWork){
  nextEffect = finishedWork;
  commitPassiveMountEffects_begin(finishedWork, root)
}


function commitPassiveMountEffects_begin(subtreeRoot,root){
  while(nextEffect != null){
    const fiber = nextEffect;
    const firstChild = fiber.child;
    if((fiber.subtreeFlags & PassiveMask) != NoFlags && firstChild != null){
      nextEffect = firstChild;
    }else{
      commitPassiveMountEffects_complete(subtreeRoot,root)
    }
  }
}

function commitPassiveMountEffects_complete(subtreeRoot,root){
  while(nextEffect != null){
    const fiber = nextEffect

    if((fiber.flags & Passive) != NoFlags){
      try{
        commitPassiveMountOnFiber(root,fiber)
      }catch(error){
        debugger
        // captureCommitPhaseError(fiber, fiber.return, error)
      }
      
    }
    if(fiber == subtreeRoot){
      nextEffect = null
      return
    }
    const sibling = fiber.sibling
    if (sibling !== null) {
      nextEffect = sibling;
      return;
    }
    nextEffect = fiber.return;
  }
}

function commitPassiveMountOnFiber(finishedRoot,finishedWork){
  switch(finishedWork.tag){
    case FunctionComponent:
      if(finishedWork.mode & ProfileMode){
        try{
          commitHookEffectListMount(HookPassive | HookHasEffect , finishedWork)
        }finally{
          debugger

        }
      }
      break
  }
}

function commitHookEffectListMount(tag,finishedWork){
  const updateQueue = finishedWork.updateQueue
  const lastEffect = updateQueue != null ? updateQueue.lastEffect : null
  if(lastEffect != null){
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do{
      if((effect.tag & tag) == tag){
        const create = effect.create
        effect.destroy = create();
        const destroy = effect.destroy;
        if(destroy != undefined && typeof destroy != 'function'){
          console.error(' destroy is error')
        }
      }
      effect = effect.next
    }while(effect !== firstEffect)
  }
}