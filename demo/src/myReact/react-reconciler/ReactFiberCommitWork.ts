import {
  appendChild,
  appendChildToContainer,
  commitTextUpdate,
  commitUpdate,
  getPublicInstance,
  insertBefore,
  removeChild,
  removeChildFromContainer,
} from "../react-dom/client/ReactDOMHostConfig";
import { deletedTreeCleanUpLevel } from "../shared/ReactFeatureFlags";
import {
  MutationMask,
  NoFlags,
  Placement,
  Update,
  LayoutMask,
  Callback,
  Ref,
  PassiveMask,
  Passive,
  ChildDeletion,
  Visibility,
} from "./ReactFiberFlags";
import { NoLane, NoLanes } from "./ReactFiberLane";
import { resolveRetryWakeable ,restorePendingUpdaters } from "./ReactFiberWorkLoop";
import {
  Passive as HookPassive,
  HasEffect as HookHasEffect,
  Layout as HookLayout,
  Insertion as HookInsertion,
  NoFlags as NoHookEffect,
} from "./ReactHookEffectTags";
import { ConcurrentMode, NoMode, ProfileMode } from "./ReactTypeOfMode";
import {
  ForwardRef,
  FunctionComponent,
  HostComponent,
  HostPortal,
  HostRoot,
  HostText,
  MemoComponent,
  OffscreenComponent,
  SimpleMemoComponent,
  SuspenseComponent,
  SuspenseListComponent,
} from "./ReactWorkTags";

let nextEffect: any = null;
let inProgressLanes = null;
let inProgressRoot = null;

let hostParent = null;
let hostParentIsContainer = false;

let offscreenSubtreeIsHidden = false;
let offscreenSubtreeWasHidden = false;

export function commitMutationEffects(root, finishedWork, committedLanes) {
  inProgressLanes = committedLanes;
  inProgressRoot = root;
  // commitMutationEffects_begin(root)
  commitMutationEffectsOnFiber(finishedWork, root, committedLanes);
  // nextEffect = null
  inProgressRoot = null;
  inProgressLanes = null;
}

function commitMutationEffectsOnFiber(finishedWork, root, lanes) {
  const current = finishedWork.alternate;
  const flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case HostRoot: {
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      commitReconciliationEffects(finishedWork);
      if (flags & Update) {
      }
      break;
    }
    case HostPortal: {
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      commitReconciliationEffects(finishedWork);
      return;
    }

    case SuspenseComponent: {
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      commitReconciliationEffects(finishedWork);

      const offscreenFiber = finishedWork.child;
      if (offscreenFiber.flags & Visibility) {
        const offscreenInstance = offscreenFiber.stateNode;
        const newState = offscreenFiber.memoizedState;
        const isHidden = newState != null;

        offscreenInstance.isHidden = isHidden;

        if (isHidden) {
          const wasHidden =
            offscreenFiber.alternate != null &&
            offscreenFiber.alternate.memoizedState != null;
          if (!wasHidden) {

          }
        }
      }

      if(flags & Update){
        commitSuspenseCallback(finishedWork);
        const wakeables = finishedWork.updateQueue
        if(wakeables != null){
          finishedWork.updateQueue = null;
          attachSuspenseRetryListeners(finishedWork, wakeables);
        }
      }
      return;
    }
    case OffscreenComponent: {
      debugger
      const newState = finishedWork.memoizedState;
      const isHidden = newState != null;
      const wasHidden = current != null && current.memoizedState != null;

      if (finishedWork.mode && ConcurrentMode) {
        const prevOffscreenSubtreeIsHidden = offscreenSubtreeIsHidden;
        const prevOffscreenSubtreeWasHidden = offscreenSubtreeWasHidden;

        offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden || isHidden;
        offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden || wasHidden;

        recursivelyTraverseMutationEffects(root, finishedWork, lanes);
        offscreenSubtreeWasHidden = prevOffscreenSubtreeWasHidden;
        offscreenSubtreeIsHidden = prevOffscreenSubtreeIsHidden;
      } else {
        recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      }

      commitReconciliationEffects(finishedWork);

      if (flags & Visibility) {
        const offscreenInstance = finishedWork.stateNode;
        const offscreenBoundary = finishedWork;
        offscreenInstance.isHidden = isHidden;
        if (isHidden) {
          if (!wasHidden) {
            if ((offscreenBoundary.mode & ConcurrentMode) !== NoMode) {
              recursivelyTraverseDisappearLayoutEffects(offscreenBoundary);
            }
          }
        }

        hideOrUnhideAllChildren(offscreenBoundary, isHidden);
      }

      if (flags & Update) {
      }

      return;
    }
    case HostComponent: {
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      commitReconciliationEffects(finishedWork);
      if (flags & Ref) {
        if (current != null) {
          // safelyDetachRef(current, current.return);
        }
      }

      if (flags & Update) {
        const instance = finishedWork.stateNode;
        if (instance != null) {
          const newProps = finishedWork.memoizedProps;
          const oldProps = current != null ? current.memoizedProps : newProps;
          const type = finishedWork.type;
          const updateQueue = finishedWork.updateQueue;
          finishedWork.updateQueue = null;
          if (updateQueue != null) {
            try {
              commitUpdate(
                instance,
                updateQueue,
                type,
                oldProps,
                newProps,
                finishedWork
              );
            } catch (e) {
              console.error(e, "e");
            }
          }
        }
      }
      break;
    }
    case HostText: {
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      commitReconciliationEffects(finishedWork);
      if (flags & Update) {
        const textInstance = finishedWork.stateNode;
        const newText: string = finishedWork.memoizedProps;
        const oldText: string =
          current != null ? current.memoizedProps : newText;

        try {
          commitTextUpdate(textInstance, oldText, newText);
        } catch (error) {
          console.error("error");
          // captureCommitPhaseError(finishedWork, finishedWork.return, error);
        }
      }
      break;
    }
    case ForwardRef:
    case SimpleMemoComponent:
    case FunctionComponent: {
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      commitReconciliationEffects(finishedWork);
      if (flags & Update) {
        try {
          commitHookEffectListUnmount(
            HookInsertion | HookHasEffect,
            finishedWork,
            finishedWork.return
          );
          commitHookEffectListMount(
            HookInsertion | HookHasEffect,
            finishedWork
          );
        } catch (e) {
          console.error("e");
        }
      }
      break;
    }

    default: {
      recursivelyTraverseMutationEffects(root, finishedWork, lanes);
      commitReconciliationEffects(finishedWork);
      return;
    }
  }
}

function recursivelyTraverseMutationEffects(root, parentFiber, lanes) {
  const deletions = parentFiber.deletions;
  if (deletions != null) {
    for (let i = 0; i < deletions.length; i++) {
      const childToDelete = deletions[i];
      try {
        commitDeletionEffects(root, parentFiber, childToDelete);
      } catch (error) {
        console.error(error);
      }
    }
  }
  if (parentFiber.subtreeFlags & MutationMask) {
    let child = parentFiber.child;
    while (child != null) {
      commitMutationEffectsOnFiber(child, root, lanes);
      child = child.sibling;
    }
  }
}

function commitDeletionEffects(root, returnFiber, deletedFiber) {
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
    }
    parent = parent.return;
  }
  commitDeletionEffectsOnFiber(root, returnFiber, deletedFiber);
  hostParent = null;
  hostParentIsContainer = false;
  detachFiberMutation(deletedFiber)
}

function commitReconciliationEffects(finishedWork) {
  const flags = finishedWork.flags;
  if (flags & Placement) {
    try {
      commitPlacement(finishedWork);
    } catch (error) {
      console.error("error");
    }
    finishedWork.flags &= ~Placement;
  }
  // if (flags & Hydrating) {
  //   finishedWork.flags &= ~Hydrating;
  // }
}

function commitDeletionEffectsOnFiber(
  finishedRoot,
  nearestMountedAncestor,
  deletedFiber
) {
  switch (deletedFiber.tag) {
    case HostComponent: 
    case HostText: {
      const prevHostParent = hostParent;
      const prevHostParentIsContainer = hostParentIsContainer;
      hostParent = null;
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber
      );
      hostParent = prevHostParent;
      hostParentIsContainer = prevHostParentIsContainer;
      if (hostParent != null) {
        if (hostParentIsContainer) {
          removeChildFromContainer(hostParent, deletedFiber.stateNode);
        } else {
          removeChild(hostParent, deletedFiber.stateNode);
        }
      }
      break;
    }
    default:{
      debugger
      recursivelyTraverseDeletionEffects(
        finishedRoot,
        nearestMountedAncestor,
        deletedFiber,
      );
      return;
    }
  }
}

function recursivelyTraverseDeletionEffects(
  finishedRoot,
  nearestMountedAncestor,
  parent
) {
  let child = parent.child;
  while (child != null) {
    commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, child);
    child = child.sibling;
  }
}

function getHostParentFiber(fiber) {
  let parent = fiber.return;
  while (parent != null) {
    if(isHostParent(parent)){
      return parent
    }
    parent = parent.return;
  }
  return parent;
}

export function commitPlacement(finishedWork) {
  const parentFiber = getHostParentFiber(finishedWork);
  let parent;
  let isContainer;
  const parentStateNode = parentFiber.stateNode;
  switch (parentFiber.tag) {
    case HostPortal:
    case HostRoot: {
      parent = parentStateNode.containerInfo;
      const before = getHostSibling(finishedWork);
      insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
      isContainer = true;
      break;
    }

    case HostComponent: {
      parent = parentStateNode;
      isContainer = false;
      const before = getHostSibling(finishedWork);
      // We only have the top Fiber that was inserted but we need to recurse down its
      // children to find all the terminal nodes.
      insertOrAppendPlacementNode(finishedWork, before, parent);
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

function insertOrAppendPlacementNode(node, before, parent) {
  const { tag } = node;
  const isHost = tag == HostComponent || tag == HostText;
  if (isHost) {
    const stateNode = node.stateNode;
    if (before) {
      insertBefore(parent, stateNode, before);
    } else {
      appendChild(parent, stateNode);
    }
  }
}

function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
  const { tag } = node;
  const isHost = tag == HostText || tag == HostComponent;
  if (isHost) {
    const stateNode = node.stateNode;
    if (before) {
      //todo
    } else {
      appendChildToContainer(parent, stateNode);
    }
  } else {
    const child = node.child;
    if (child != null) {
      insertOrAppendPlacementNodeIntoContainer(child, before, parent);
      //todo
      let sibling = child.sibling;
      while(sibling != null){
        insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
        sibling = sibling.sibling;
      }
    }
  }
}

export function commitBeforeMutationEffects(root, firstChild) {}

export function commitLayoutEffects(finishedWork, root, committedLanes) {
  nextEffect = finishedWork;
  // commitLayoutEffects_begin(finishedWork, root, committedLanes)
  let current = finishedWork.alternate;
  commitLayoutEffectOnFiber(root, current, finishedWork, committedLanes);
}

function commitLayoutEffects_begin(subtreeRoot, root, committedLanes) {
  while (nextEffect != null) {
    const fiber = nextEffect;
    const firstChild = fiber.child;
    if ((fiber.subtreeFlags & LayoutMask) != NoFlags && firstChild != null) {
      nextEffect = firstChild;
    } else {
      commitLayoutMountEffects_complete(subtreeRoot, root, committedLanes);
    }
  }
}

function commitLayoutMountEffects_complete(subtreeRoot, root, committedLanes) {
  while (nextEffect != null) {
    const fiber = nextEffect;
    if ((fiber.flags & LayoutMask) != NoFlags) {
      const current = fiber.alternate;
      commitLayoutEffectOnFiber(root, current, fiber, committedLanes);
    }
    nextEffect = fiber.return;
  }
}

function commitLayoutEffectOnFiber(
  finishedRoot,
  current,
  finishedWork,
  committedLanes
) {
  const flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case ForwardRef:
    case SimpleMemoComponent:
    case FunctionComponent: {
      recursivelyTraverseLayoutEffects(
        finishedRoot,
        finishedWork,
        committedLanes
      );
      if (flags & Update) {
        commitHookLayoutEffects(finishedWork, HookLayout | HookHasEffect);
      }
      break;
    }
    case HostRoot: {
      recursivelyTraverseLayoutEffects(
        finishedRoot,
        finishedWork,
        committedLanes
      );
      if (flags & Callback) {
      }
      break;
    }
    case HostComponent: {
      recursivelyTraverseLayoutEffects(
        finishedRoot,
        finishedWork,
        committedLanes
      );
      if (current == null && flags & Update) {
        // commitHostComponentMount(finishedWork)
      }
      if (flags & Ref) {
        safelyAttachRef(finishedWork, finishedWork.return);
      }
      break;
    }
    default: {
      recursivelyTraverseLayoutEffects(
        finishedRoot,
        finishedWork,
        committedLanes
      );
      break;
    }
  }

  // if((finishedWork.flags & (Update | Callback))!=NoLane){
  //   switch(finishedWork.tag){
  //     case HostComponent:
  //       const instance = finishedWork.stateNode
  //       if(current == null && finishedWork.flags & Update){
  //         const type = finishedWork.type;
  //         const props = finishedWork.memoizedProps;
  //         debugger
  //         // commitMount(instance, type, props, finishedWork);
  //       }
  //       break;
  //     case ForwardRef:
  //     case FunctionComponent:
  //       commitHookEffectListMount(HookLayout | HookHasEffect,finishedWork )
  //       break
  //   }
  // }

  // if(finishedWork.flags & Ref){
  //   commitAttachRef(finishedWork)
  // }
}

function safelyAttachRef(current, nearestMountedAncestor) {
  try {
    commitAttachRef(current);
  } catch (error) {
    // captureCommitPhaseError(current, nearestMountedAncestor, error);
  }
}

function commitHookLayoutEffects(finishedWork, hookFlags) {
  try {
    commitHookEffectListMount(hookFlags, finishedWork);
  } catch (e) {
    console.log(e);
  }
}

function recursivelyTraverseLayoutEffects(root, parentFiber, lanes) {
  if (parentFiber.subtreeFlags & LayoutMask) {
    let child = parentFiber.child;
    while (child != null) {
      const current = child.alternate;
      commitLayoutEffectOnFiber(root, current, child, lanes);
      child = child.sibling;
    }
  }
}

function commitAttachRef(finishedWork) {
  const ref = finishedWork.ref;
  if (ref != null) {
    const instance = finishedWork.stateNode;
    let instanceToUse;
    switch (finishedWork.tag) {
      case HostComponent: {
        instanceToUse = getPublicInstance(instance);

        break;
      }
      default:
        instanceToUse = instance;
    }
    if (typeof ref == "function") {
      let retVal = ref(instanceToUse);
    } else {
      ref.current = instance;
    }
  }
}

export function commitPassiveUnmountEffects(finishedWork) {
  // commitPassiveUnmountEffects_begin()
  commitPassiveUnmountOnFiber(finishedWork);
}

function commitPassiveUnmountEffects_begin() {
  while (nextEffect != null) {
    const fiber = nextEffect;
    const child = fiber.child;
    if ((child.subtreeFlags & PassiveMask) != NoLanes && child != null) {
      nextEffect = child;
    } else {
      commitPassiveUnmountEffects_complete();
    }
  }
}

function commitPassiveUnmountEffects_complete() {
  while (nextEffect != null) {
    const fiber = nextEffect;
    if ((fiber.flags & Passive) != NoFlags) {
      commitPassiveUnmountOnFiber(fiber);
    }
    const sibling = fiber.sibling;
    if (sibling != null) {
      nextEffect = sibling;
      return;
    }
    nextEffect = fiber.return;
  }
}

// function commitPassiveUnmountOnFiber(finishedWork){
//   switch(finishedWork.tag){
//     case FunctionComponent:
//       commitHookEffectListUnmount(HookPassive |HookHasEffect , finishedWork, finishedWork.return )
//       break;
//   }
// }

function commitHookEffectListUnmount(
  flags,
  finishedWork,
  nearestMountedAncestor
) {
  const updateQueue = finishedWork.updateQueue;
  const lastEffect = updateQueue != null ? updateQueue.lastEffect : null;
  if (lastEffect != null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      if ((effect.tag & flags) == flags) {
        const destroy = effect.destroy;
        effect.destroy = undefined;
        if (destroy != undefined) {
          safelyCallDestroy(finishedWork, nearestMountedAncestor, destroy);
        }
      }
      effect = effect.next;
    } while (effect != firstEffect);
  }
}

export function commitPassiveMountEffects(
  root,
  finishedWork,
  committedLanes,
  committedTransitions
) {
  nextEffect = finishedWork;
  // commitPassiveMountEffects_begin(finishedWork, root)
  commitPassiveMountOnFiber(
    root,
    finishedWork,
    committedLanes,
    committedTransitions
  );
}

// function commitPassiveMountEffects_begin(subtreeRoot,root){
//   while(nextEffect != null){
//     const fiber = nextEffect;
//     const firstChild = fiber.child;
//     if((fiber.subtreeFlags & PassiveMask) != NoFlags && firstChild != null){
//       nextEffect = firstChild;
//     }else{
//       commitPassiveMountEffects_complete(subtreeRoot,root)
//     }
//   }
// }

// function commitPassiveMountEffects_complete(subtreeRoot,root){
//   while(nextEffect != null){
//     const fiber = nextEffect

//     if((fiber.flags & Passive) != NoFlags){
//       try{
//         commitPassiveMountOnFiber(root,fiber)
//       }catch(error){
//         debugger
//         // captureCommitPhaseError(fiber, fiber.return, error)
//       }

//     }
//     if(fiber == subtreeRoot){
//       nextEffect = null
//       return
//     }
//     const sibling = fiber.sibling
//     if (sibling != null) {
//       nextEffect = sibling;
//       return;
//     }
//     nextEffect = fiber.return;
//   }
// }

function recursivelyTraversePassiveMountEffects(
  root,
  parentFiber,
  committedLanes,
  committedTransitions
) {
  if (parentFiber.subtreeFlags & PassiveMask) {
    let child = parentFiber.child;
    while (child != null) {
      commitPassiveMountOnFiber(
        root,
        child,
        committedLanes,
        committedTransitions
      );
      child = child.sibling;
    }
  }
}

function commitPassiveMountOnFiber(
  finishedRoot,
  finishedWork,
  committedLanes,
  committedTransitions
) {
  const flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case SimpleMemoComponent:
    case FunctionComponent: {
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      );
      if (flags & Passive) {
        commitHookEffectListMount(HookPassive | HookHasEffect, finishedWork);
      }
      break;
    }
    case HostRoot: {
      recursivelyTraversePassiveMountEffects(
        finishedRoot,
        finishedWork,
        committedLanes,
        committedTransitions
      );
      if (flags & Passive) {
        debugger;
      }
      break;
    }
  }
}

function commitHookEffectListMount(flags, finishedWork) {
  const updateQueue = finishedWork.updateQueue;
  const lastEffect = updateQueue != null ? updateQueue.lastEffect : null;

  if (lastEffect != null) {
    const firstEffect = lastEffect.next;
    let effect = firstEffect;
    do {
      if ((effect.tag & flags) == flags) {
        if ((flags & HookPassive) != NoHookEffect) {
          // markComponentPassiveEffectMountStarted(finishedWork)
        } else if ((flags & HookLayout) != NoHookEffect) {
          // markComponentLayoutEffectMountStarted(finishedWork)
        }
        const create = effect.create;
        effect.destroy = create();
        const destroy = effect.destroy;
        if (destroy != undefined && typeof destroy != "function") {
          console.error(" destroy is error");
        }
      }
      effect = effect.next;
    } while (effect != firstEffect);
  }
}

function safelyCallDestroy(current, nearestMountedAncestor, destroy) {
  try {
    destroy();
  } catch (e) {
    console.log(e, "error");
  }
}

export function commitDeletion(finishedRoot, current, nearestMountedAncestor) {
  unmountHostComponents(finishedRoot, current, nearestMountedAncestor);
  detachFiberMutation(current);
}

function unmountHostComponents(finishedRoot, current, nearestMountedAncestor) {
  let node = current;
  let currentParentIsContainer;
  let currentParent;
  let currentParentIsValid = false;
  while (true) {
    if (!currentParentIsValid) {
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

    if (node.tag == HostComponent || node.tag == HostText) {
      if (currentParentIsContainer) {
      } else {
        removeChild(currentParent, node.stateNode);
      }
    }

    if (node == current) {
      return;
    }
  }
}

function detachFiberMutation(fiber) {
  const alternate = fiber.alternate;
  if (alternate != null) {
    alternate.return = null;
  }
  fiber.return = null;
}

function isHostParent(fiber) {
  return fiber.tag == HostComponent || fiber.tag == HostRoot;
}

function getHostSibling(fiber) {
  let node = fiber;
  siblings: while (true) {
    while (node.sibling == null) {
      if (node.return == null || isHostParent(node.return)) {
        return null;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;

    if (!(node.flags & Placement)) {
      return node.stateNode;
    }
  }
}

function commitPassiveUnmountOnFiber(finishedWork) {
  switch (finishedWork.tag) {
    case SimpleMemoComponent:
    case FunctionComponent: {
      recursivelyTraversePassiveUnmountEffects(finishedWork);
      if (finishedWork.flags & Passive) {
        if (finishedWork.mode & ProfileMode) {
          commitHookEffectListUnmount(
            HookPassive | HookHasEffect,
            finishedWork,
            finishedWork.return
          );
          // recordPassiveEffectDuration(finishedWork)
        } else {
          commitHookEffectListUnmount(
            HookPassive | HookHasEffect,
            finishedWork,
            finishedWork.return
          );
        }
      }
      break;
    }
    default: {
      recursivelyTraversePassiveUnmountEffects(finishedWork);
      break;
    }
  }
}

function recursivelyTraversePassiveUnmountEffects(parentFiber) {
  const deletions = parentFiber.deletions;
  if ((parentFiber.flags & ChildDeletion) != NoFlags) {
    if (deletions != null) {
      for (let i = 0; i < deletions.length; i++) {
        const childToDelete = deletions[i];
        nextEffect = childToDelete;
        commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
          childToDelete,
          parentFiber
        );
      }
    }

    const previousFiber = parentFiber.alternate;
    if (previousFiber != null) {
      let detachedChild = previousFiber.child;
      if (detachedChild != null) {
        previousFiber.child = null;
        do {
          const detachedSibling = detachedChild.sibling;
          detachedChild.sibling = null;
          detachedChild = detachedSibling;
        } while (detachedChild != null);
      }
    }
  }
  if (parentFiber.subtreeFlags & PassiveMask) {
    let child = parentFiber.child;
    while (child != null) {
      commitPassiveUnmountOnFiber(child);
      child = child.sibling;
    }
  }
}

function commitPassiveUnmountEffectsInsideOfDeletedTree_begin(
  deletedSubtreeRoot,
  nearestMountedAncestor
) {
  while (nextEffect != null) {
    const fiber = nextEffect;
    commitPassiveUnmountInsideDeletedTreeOnFiber(fiber, nearestMountedAncestor);
    const child = fiber.child;
    if (child != null) {
      child.return = fiber;
      nextEffect = child;
    } else {
      commitPassiveUnmountEffectsInsideOfDeletedTree_complete(
        deletedSubtreeRoot
      );
    }
  }
}

function commitPassiveUnmountInsideDeletedTreeOnFiber(
  current,
  nearestMountedAncestor
) {
  switch (current.tag) {
  }
}

function commitPassiveUnmountEffectsInsideOfDeletedTree_complete(
  deletedSubtreeRoot
) {
  while (nextEffect != null) {
    const fiber = nextEffect;
    const sibling = fiber.sibling;
    const returnFiber = fiber.return;
    if (deletedTreeCleanUpLevel >= 2) {
      detachFiberAfterEffects(fiber);
      if (fiber == deletedSubtreeRoot) {
        nextEffect = null;
        return;
      }
    }
    if (sibling != null) {
      sibling.return = returnFiber;
      nextEffect = sibling;
      return;
    }
    nextEffect = returnFiber;
  }
}

function detachFiberAfterEffects(fiber) {
  debugger;
  const alternate = fiber.alternate;
  if (alternate != null) {
    fiber.alternate = null;
    detachFiberAfterEffects(alternate);
  }
  if (!(deletedTreeCleanUpLevel >= 2)) {
  } else {
    fiber.child = null;
    fiber.deletions = null;
    fiber.sibling = null;
    if (fiber.tag == HostComponent) {
      const hostInstance = fiber.stateNode;
      if (hostInstance != null) {
        // detachDeletedInstance(hostInstance);
      }
    }
    fiber.stateNode = null;
    if (deletedTreeCleanUpLevel >= 3) {
      fiber.return = null;
      fiber.dependencies = null;
      fiber.memoizedProps = null;
      fiber.memoizedState = null;
      fiber.pendingProps = null;
      fiber.stateNode = null;
      // TODO: Move to `commitPassiveUnmountInsideDeletedTreeOnFiber` instead.
      fiber.updateQueue = null;
    }
  }
}

function recursivelyTraverseDisappearLayoutEffects(parentFiber) {
  let child = parentFiber.child;
  // while (child != null) {}
}

function hideOrUnhideAllChildren(finishedWork, isHidden) {
  let hostSubtreeRoot = null;
  let node = finishedWork;
  while (true) {
    if (node.tag === HostComponent) {
    }

    if (node === finishedWork) {
      return;
    }
  }
}

function commitSuspenseCallback(finishedWork){
  const newState = finishedWork.memoizedState;


}


function attachSuspenseRetryListeners(finishedWork,wakeables){
  debugger
  const retryCache = getRetryCache(finishedWork);
  wakeables.forEach(wakeable => {
    const retry = resolveRetryWakeable.bind(null,finishedWork, wakeable);
    
    if (!retryCache.has(wakeable)) {
      retryCache.add(wakeable);
      if(inProgressLanes != null && inProgressRoot != null ){
        restorePendingUpdaters(inProgressRoot, inProgressLanes)
      }

      wakeable.then(retry,retry);
    }

  });
}

function getRetryCache(finishedWork){
  switch (finishedWork.tag) {
    case SuspenseListComponent:
    case SuspenseComponent:{
      let retryCache = finishedWork.stateNode;
      if (retryCache == null) {
        retryCache = finishedWork.stateNode = new WeakSet();
      }
      return retryCache;
    }
    case OffscreenComponent: {
      const instance = finishedWork.stateNode;
      let retryCache = instance.retryCache;
      if (retryCache == null) {
        retryCache = instance.retryCache = new WeakSet();
      }
      return retryCache;
    }
      
  }

}
