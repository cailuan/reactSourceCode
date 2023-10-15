import { appendChild, appendChildToContainer, commitTextUpdate, commitUpdate, insertBefore, removeChild, removeChildFromContainer, resetTextContent } from "../react-dom/client/ReactDOMHostConfig"
import { MutationMask, NoFlags, Placement, Update,LayoutMask, Callback, Ref, PassiveMask,Passive, Hydrating, ContentReset } from "./ReactFiberFlags"
import { NoLane, NoLanes } from "./ReactFiberLane"
import { Passive as HookPassive , Layout as HookLayout,NoFlags as NoHookEffect, Insertion as HookInsertion,
  HasEffect as HookHasEffect,
  Layout,
  HasEffect, } from "./ReactHookEffectTags"
import { ConcurrentMode, ProfileMode } from "./ReactTypeOfMode"
import { ForwardRef, FunctionComponent, HostComponent, HostPortal, HostRoot, HostText, MemoComponent } from "./ReactWorkTags"

let nextEffect:any = null
let inProgressLanes = null
let inProgressRoot = null

let offscreenSubtreeWasHidden = false;

export function commitMutationEffects(root,finishedWork,committedLanes){
  inProgressLanes = committedLanes;
  inProgressRoot = root;
  commitMutationEffectsOnFiber(finishedWork,root,committedLanes)
  inProgressLanes = null;
  inProgressRoot = null;
}



function commitMutationEffectsOnFiber(finishedWork,root,lanes){
  console.log(finishedWork,"finishedWork");
  const current = finishedWork.alternate;
  const flags = finishedWork.flags;
  switch(finishedWork.tag){
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:{
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      commitReconciliationEffects(finishedWork);
      if(flags & Update){
        try{
          commitHookEffectListUnmount(
            HookInsertion | HookHasEffect,
            finishedWork,
            finishedWork.return,
          );
          commitHookEffectListMount(
            HookInsertion | HookHasEffect,
            finishedWork,
          );
        }catch(e){}
        if(finishedWork.mode & ProfileMode){
          commitHookEffectListUnmount(Layout | HasEffect, finishedWork, finishedWork.return);
          // recordLayoutEffectDuration(finishedWork);
        }

      }
      return;
    }
    case HostRoot:{
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      commitReconciliationEffects(finishedWork);
      if (flags & Update) {
        if (current != null) {
          var prevRootState = current.memoizedState;

          if (prevRootState.isDehydrated) {
            try {
              // commitHydratedContainer(root.containerInfo);
            } catch (error) {
              // captureCommitPhaseError(finishedWork, finishedWork.return, error);
            }
          }
        }
      }
      return ;
    }
    case HostComponent:{
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      commitReconciliationEffects(finishedWork);
      
      if(flags & Ref){
        if (current != null) {
          safelyDetachRef(current, current.return);
        }
      }
      if(finishedWork.flags & ContentReset){
        const instance = finishedWork.stateNode;
          try {
            resetTextContent(instance);
          } catch (error) {
            // captureCommitPhaseError(finishedWork, finishedWork.return, error);
          }
      }

      if(flags & Update){
        const instance = finishedWork.stateNode;
        if (instance != null) {
          const newProps = finishedWork.memoizedProps;
          const oldProps =
              current != null ? current.memoizedProps : newProps;
          const type = finishedWork.type;
          const updatePayload = (finishedWork.updateQueue);
          finishedWork.updateQueue = null;

          if (updatePayload != null) {
            try {
              commitUpdate(
                instance,
                updatePayload,
                type,
                oldProps,
                newProps,
                finishedWork,
              );
            } catch (error) {
              // captureCommitPhaseError(
              //   finishedWork,
              //   finishedWork.return,
              //   error,
              // );
            }
          }

        }
      }
      return;
    }
  }
}

function recursivelyTraverseMutationEffects(root, parentFiber, lanes){
  const deletions = parentFiber.deletions;
  if (deletions != null) {
    for (let i = 0; i < deletions.length; i++) {
      const childToDelete = deletions[i];
      try {
        commitDeletionEffects(root, parentFiber, childToDelete);
      } catch (error) {
        // captureCommitPhaseError(childToDelete, parentFiber, error);
      }
    }
  }
  if (parentFiber.subtreeFlags & MutationMask) {
    let child = parentFiber.child;
    while(child != null){
      commitMutationEffectsOnFiber(child, root, lanes);
      child = child.sibling;
    }
  }

}

let hostParent = null;
let hostParentIsContainer = false;

function commitDeletionEffects(root, returnFiber, deletedFiber){
  let parent = returnFiber;
  findParent: while (parent != null) {
    switch (parent.tag) {
      case HostComponent: {
        hostParent = parent.stateNode;
        hostParentIsContainer = false;
        break findParent;
      }
      case HostRoot: {
        hostParent = parent.stateNode.containerInfo;
        hostParentIsContainer = true;
        break findParent;
      }
      case HostPortal: {
        hostParent = parent.stateNode.containerInfo;
        hostParentIsContainer = true;
        break findParent;
      }
    }
    parent = parent.return;
  }
  commitDeletionEffectsOnFiber(root, returnFiber, deletedFiber)
  hostParent = null;
  hostParentIsContainer = false;

  detachFiberMutation(deletedFiber);
}

function commitDeletionEffectsOnFiber(finishedRoot,nearestMountedAncestor, deletedFiber ){
  switch(deletedFiber.tag) {
 
    case FunctionComponent:
    case ForwardRef:
    case MemoComponent:{
      const updateQueue = deletedFiber.updateQueue;
      if(updateQueue != null){
        const lastEffect = updateQueue.lastEffect;
        if (lastEffect != null) {

          const firstEffect = lastEffect.next;

          let effect = firstEffect;
          do{
            const {destroy, tag} = effect;
            if (destroy != undefined) {
              if ((tag & HookInsertion ) != NoHookEffect ) {
                safelyCallDestroy(
                  deletedFiber,
                  nearestMountedAncestor,
                  destroy,
                );
              }else if((tag & HookLayout) != NoHookEffect){
                if(deletedFiber.mode & ProfileMode){
                  safelyCallDestroy(
                    deletedFiber,
                    nearestMountedAncestor,
                    destroy,
                  );
                  // recordLayoutEffectDuration(deletedFiber);
                }else {
                  safelyCallDestroy(
                    deletedFiber,
                    nearestMountedAncestor,
                    destroy,
                  );
                }
              }

            }
            effect = effect.next;
          }while(effect != firstEffect)
        }
      }
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber,
      );
      return;
    }
    // @ts-ignore
    case HostComponent: {
      if(!offscreenSubtreeWasHidden){
        safelyDetachRef(deletedFiber, nearestMountedAncestor)
      };
      
    }
    // falls through
    // @ts-ignore
     // eslint-disable-next-line-no-fallthrough
    case HostText:{
      const prevHostParent = hostParent;
      const prevHostParentIsContainer = hostParentIsContainer;
      hostParent = null;
      recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
      hostParent = prevHostParent;
      hostParentIsContainer = prevHostParentIsContainer;
      if (hostParent != null) {
        if (hostParentIsContainer) {
          removeChildFromContainer(
            (hostParent),
            (deletedFiber.stateNode),
          );
        } else {
          removeChild(
            (hostParent),
            (deletedFiber.stateNode),
          );
        }
      }
      return;
    }
    
    default: {
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber,
      );
      return;
    }
  }
}

function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor,parent ){
  let child = parent.child;
  while (child != null) {
    commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, child);
    child = child.sibling;
  }
}

function commitReconciliationEffects(finishedWork){
  const flags = finishedWork.flags;
  if (flags & Placement) {
    try {
      commitPlacement(finishedWork);
    } catch (error) {
      // captureCommitPhaseError(finishedWork, finishedWork.return, error);
    }

    finishedWork.flags &= ~Placement;
  }
  if (flags & Hydrating) {
    finishedWork.flags &= ~Hydrating;
  }
}

function safelyDetachRef(current, nearestMountedAncestor){
  const ref = current.ref;
  if (ref != null) {
    ref.current = null;
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
    case HostRoot:{
      const parent = parentFiber.stateNode.containerInfo;
      const before = getHostSibling(finishedWork);
      insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
      break
    }
      
    case HostComponent:{
      const parent = parentFiber.stateNode;
      if (parentFiber.flags & ContentReset) {
        
        // Reset the text content of the parent before doing any insertions
        resetTextContent(parent);
        
        // Clear ContentReset from the effect tag
        parentFiber.flags &= ~ContentReset;

        const before = getHostSibling(finishedWork);
        insertOrAppendPlacementNode(finishedWork, before, parent);
      }
      break;
    }
     
  }

  // let before = getHostSibling(finishedWork)

  // if(isContainer){
  //   insertOrAppendPlacementNodeIntoContainer(finishedWork,null,parent)
  // }else{
  //   insertOrAppendPlacementNode(finishedWork, before, parent)
  // }
}

function insertOrAppendPlacementNode(node,before,parent){
  const {tag} = node;
  const isHost = tag == HostComponent || tag == HostText;
  if(isHost){
    const stateNode = node.stateNode;
    if(before){
      insertBefore(parent, stateNode, before);
      
    }else{
      appendChild(parent, stateNode);
      
    }
  }
}

function insertOrAppendPlacementNodeIntoContainer(node,before,parent){
  const {tag} = node;
  const isHost = tag == HostText || tag == HostComponent
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
        const oldProps = current != null ? current.memoizedProps : newProps;
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
    case FunctionComponent:
      commitHookEffectListUnmount(HookLayout | HookHasEffect,finishedWork,finishedWork.return)
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
        break;
      case ForwardRef:
      case FunctionComponent:
        commitHookEffectListMount(HookLayout | HookHasEffect,finishedWork )
        break
    }
  }

  if(finishedWork.flags & Ref){
    commitAttachRef(finishedWork)
  }
}

function commitAttachRef(finishedWork){
  
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
      if((effect.tag & flags) == flags){
        const destroy = effect.destroy;
        effect.destroy = undefined;
        if(destroy != undefined){
          safelyCallDestroy(finishedWork,nearestMountedAncestor,destroy)
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
    if (sibling != null) {
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
    }while(effect != firstEffect)
  }
}

function safelyCallDestroy(current,nearestMountedAncestor,destroy){
  try{
    destroy()
  }catch(e){
    console.log(e,'error')
  }
}

export function commitDeletion(finishedRoot,current,nearestMountedAncestor){
  unmountHostComponents(finishedRoot, current, nearestMountedAncestor)
  detachFiberMutation(current)
}


function unmountHostComponents(finishedRoot,current,nearestMountedAncestor){
  let node = current
  let currentParentIsContainer
  let currentParent;
  let currentParentIsValid = false;
  while(true){

    if(!currentParentIsValid){
      let parent = node.return;
      findParent: while (true) {
        const parentStateNode = parent.stateNode;
        switch (parent.tag) {
          case HostComponent:
            currentParent = parentStateNode;
            currentParentIsContainer = false;
            break findParent;
          case HostRoot:
            currentParent = parentStateNode.containerInfo;
            currentParentIsContainer = true;
            break findParent;
        }
        parent = parent.return;

      }
      currentParentIsValid = true;
    }

    if(node.tag == HostComponent || node.tag == HostText){
      if(currentParentIsContainer){}else{
        removeChild(currentParent,node.stateNode)
      }
    }


    if(node == current){
      return
    }
  }
}


function detachFiberMutation(fiber){
  const alternate = fiber.alternate;
  if(alternate != null ){
    alternate.return = null
  }
  fiber.return = null
}

function isHostParent(fiber){
  return fiber.tag == HostComponent || fiber.tag == HostRoot
}

function getHostSibling(fiber){
  let node = fiber
  siblings:while(true){
    while(node.sibling == null){
      if(node.return == null || isHostParent(node.return)){
        return null
      }
      node = node.return
    } 
    node.sibling.return = node.return;
    node = node.sibling;


    if(!(node.flags & Placement)){
      return  node.stateNode
    }
  }
}