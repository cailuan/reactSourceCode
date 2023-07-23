import {
  createTextInstance,
  createInstance,
  finalizeInitialChildren,
  appendInitialChild,
  prepareUpdate,
  preparePortalMount,
} from "../react-dom/client/ReactDOMHostConfig";
import { Passive, Ref, RefStatic, Snapshot, Update, Visibility } from "./ReactFiberFlags";
import { getRootHostContainer } from "./ReactFiberHostContext";
import { mergeLanes, NoLanes } from "./ReactFiberLane";
import { popProvider } from "./ReactFiberNewContext";
import { ConcurrentMode, NoMode, ProfileMode } from "./ReactTypeOfMode";
import {
  ContextProvider,
  ForwardRef,
  Fragment,
  FunctionComponent,
  HostComponent,
  HostPortal,
  HostRoot,
  HostText,
  MemoComponent,
  OffscreenComponent,
  SimpleMemoComponent,
  SuspenseComponent,
} from "./ReactWorkTags";
import { renderDidSuspend } from "./ReactFiberWorkLoop"

function markRef(workInProgress) {
  workInProgress.flags |= Ref;
  workInProgress.flags |= RefStatic;
}

function markUpdate(workInProgress) {
  workInProgress.flags |= Update;
}

let updateHostComponent = function (
  current,
  workInProgress,
  type,
  newProps,
  rootContainerInstance
) {
  const oldProps = current.memoizedProps;
  if (oldProps == newProps) {
    return;
  }
  const instance = workInProgress.stateNode;
  const updatePayload = prepareUpdate(
    instance,
    type,
    oldProps,
    newProps,
    rootContainerInstance,
    {}
  );
  workInProgress.updateQueue = updatePayload;
  if (updatePayload) {
    markUpdate(workInProgress);
  }
};
let updateHostText = function (current, workInProgress, oldText, newText) {
  if (oldText != newText) {
    markUpdate(workInProgress);
  }
};

const appendAllChildren = function (
  parent,
  workInProgress,
  needsVisibilityToggle,
  isHidden
) {
  let node = workInProgress.child;
  while (node != null) {
    if (node.tag == HostComponent || node.tag == HostText) {
      appendInitialChild(parent, node.stateNode);
    } else if (node.child != null) {
      node.child.return = node;
      node = node.child;
      continue;
    }

    while (node.sibling == null) {
      if (node.return == null || node.return == workInProgress) {
        return;
      }
      node = node.return;
    }
    node = node.sibling;
  }
};

export function completeWork(current, workInProgress, renderLanes) {
  const newProps = workInProgress.pendingProps;
  const _rootContainerInstance = getRootHostContainer();
  switch (workInProgress.tag) {
    case FunctionComponent:
    case ForwardRef:
    case Fragment:

    case SimpleMemoComponent:
      bubbleProperties(workInProgress);
      return null;

    case HostText:
      const newText = newProps;
      if (current && workInProgress.stateNode != null) {
        const oldText = current.memoizedProps;
        updateHostText(current, workInProgress, oldText, newText);
      } else {
        workInProgress.stateNode = createTextInstance(
          newText,
          _rootContainerInstance,
          {},
          workInProgress
        );
      }

      bubbleProperties(workInProgress);
      return null;
    case HostRoot:
      workInProgress.flags |= Snapshot;

      const fiberRoot = workInProgress.stateNode;

      bubbleProperties(workInProgress);
      break;
    case HostPortal: {
      if (current == null) {
        preparePortalMount(workInProgress.stateNode.containerInfo);
        // preparePortalMount
      }
      bubbleProperties(workInProgress);

      return null;
    }
    case SuspenseComponent: {
      const nextState = workInProgress.memoizedState;
      if (
        current == null ||
        (current.memoizedState != null &&
          current.memoizedState.dehydrated != null)
      ) {

      }


      const nextDidTimeout = nextState != null;

      const prevDidTimeout =
        current != null && (current.memoizedState) != null;


      if (nextDidTimeout) {
        const offscreenFiber = workInProgress.child;
        let previousCache = null;

        offscreenFiber.flags |= Passive;

      }

      if (nextDidTimeout !== prevDidTimeout) {
        // const offscreenFiber = workInProgress.child;
        // offscreenFiber.flags |= Passive;

        if (nextDidTimeout) {
          const offscreenFiber = workInProgress.child;
          offscreenFiber.flags |= Visibility;

          renderDidSuspend()
        }
      }




      const wakeables = workInProgress.updateQueue;
      if (wakeables != null) {
        workInProgress.flags |= Update;
      }

      bubbleProperties(workInProgress);


      return null
    }
    case OffscreenComponent: {
      const nextState = workInProgress.memoizedState;
      const nextIsHidden = null;
      if (current != null) {
        const prevState = current.memoizedState;
        const prevIsHidden = null;
        if (nextIsHidden != prevIsHidden) {
          workInProgress.flags |= Visibility;
        }

      }

      if (!nextIsHidden || (workInProgress.mode & ConcurrentMode) == NoMode) {
        bubbleProperties(workInProgress);
      } else {
        debugger
      }
      // let previousCache = null;
      // if(current != current && current.memoizedState != null && current.memoizedState.cachePool != null){
      //   previousCache = current.memoizedState.cachePool;
      // }
      // let cache = null;
      // if(workInProgress.memoizedState != null && workInProgress.memoizedState.cachePool !=null){
      //   cache = workInProgress.memoizedState.cachePool
      // }

      // if (cache != previousCache) {
        // Run passive effects to retain/release the cache.
        workInProgress.flags |= Passive;
      // }
      return null;

    }
    case HostComponent:
      const rootContainerInstance = getRootHostContainer();
      const type = workInProgress.type;
      if (current != null && workInProgress.stateNode != null) {
        updateHostComponent(
          current,
          workInProgress,
          type,
          newProps,
          rootContainerInstance
        );
      } else {
        const instance = createInstance(
          type,
          newProps,
          _rootContainerInstance,
          {},
          workInProgress
        );
        appendAllChildren(instance, workInProgress, false, false);
        workInProgress.stateNode = instance;
        finalizeInitialChildren(
          instance,
          type,
          newProps,
          _rootContainerInstance
        );

        if (workInProgress.ref != null) {
          markRef(workInProgress);
        }
      }

      bubbleProperties(workInProgress);
      return null;
    case ContextProvider:
      const context = workInProgress.type._context;
      popProvider(context, workInProgress);
      bubbleProperties(workInProgress);
      return null;
  }
}

function bubbleProperties(completedWork) {
  const didBailout =
    completedWork.alternate != null &&
    completedWork.alternate.child == completedWork.child;
  let subtreeFlags: any = NoLanes;
  let newChildLanes = NoLanes;
  if (!didBailout) {
    if ((completedWork.mode & ProfileMode) != NoLanes) {
      let child = completedWork.child;
      while (child != null) {
        newChildLanes = mergeLanes(
          newChildLanes,
          mergeLanes(child.lanes, child.childLanes)
        );
        subtreeFlags |= child.subtreeFlags;
        subtreeFlags |= child.flags;
        child = child.sibling;
      }
    }

    completedWork.subtreeFlags |= subtreeFlags;
  } else {
    if ((completedWork.mode & ProfileMode) != NoLanes) {
      let child = completedWork.child;
      while (child != null) {
        newChildLanes = mergeLanes(
          newChildLanes,
          mergeLanes(child.lanes, child.childLanes)
        );
        subtreeFlags |= child.subtreeFlags;
        subtreeFlags |= child.flags;
        child = child.sibling;
      }
    }
    completedWork.subtreeFlags |= subtreeFlags;
  }
  completedWork.childLanes = newChildLanes;
  return didBailout;
}
