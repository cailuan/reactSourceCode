import ReactSharedInternals from "../react/ReactSharedInternals";
import { now, scheduleCallback } from "../scheduler/scheduler";
import { NormalPriority as NormalSchedulerPriority } from "../scheduler/SchedulerPriorities";
import {
  DiscreteEventPriority,
  getCurrentUpdatePriority,
  lanesToEventPriority,
  setCurrentUpdatePriority,
  lowerEventPriority,
  DefaultEventPriority,
} from "./ReactEventPriorities";
import { createWorkInProgress } from "./ReactFiber";
import { beginWork as originalBeginWork } from "./ReactFiberBeginWork";
import {
  commitMutationEffects,
  commitBeforeMutationEffects,
  commitLayoutEffects,
  commitPassiveUnmountEffects,
  commitPassiveMountEffects,
} from "./ReactFiberCommitWork";
import { completeWork } from "./ReactFiberCompleteWork";
import {
  finishQueueingConcurrentUpdates,
  getConcurrentlyUpdatedLanes,
  enqueueConcurrentRenderForLane,
} from "./ReactFiberConcurrentUpdates";
import { Incomplete, NoFlags, PassiveMask, HostEffectMask } from "./ReactFiberFlags";
import { scheduleMicrotask } from "./ReactFiberHostConfig";
import {
  markRootUpdated,
  mergeLanes,
  markStarvedLanesAsExpired,
  getHighestPriorityLane,
  getNextLanes,
  DefaultLane,
  NoLanes,
  SyncLane,
  markRootFinished,
  NoLane,
  includesSomeLane,
  claimNextTransitionLane,
  claimNextRetryLane,
} from "./ReactFiberLane";
import {
  scheduleSyncCallback,
  flushSyncCallbacks,
} from "./ReactFiberSyncTaskQueue";
import { throwException } from "./ReactFiberThrow";
import { NoTransition, requestCurrentTransition } from "./ReactFiberTransition";
import { unwindWork } from "./ReactFiberUnwindWork";
import { LegacyRoot } from "./ReactRootTags";
import { ConcurrentMode, NoMode, ProfileMode } from "./ReactTypeOfMode";
import { OffscreenComponent, SuspenseComponent, SuspenseListComponent } from "./ReactWorkTags";

const RootInProgress = 0;

const RootIncomplete = 0;
const RootFatalErrored = 1;
const RootErrored = 2;
const RootSuspended = 3;
const RootSuspendedWithDelay = 4;
const RootCompleted = 5;
const RootDidNotComplete = 6;

export let renderLanes = NoLanes;

let workInProgressRoot: any = null;
let workInProgress: any = null;
let workInProgressRootRenderLanes = NoLanes;
let workInProgressRootExitStatus = RootIncomplete;
let rootWithPendingPassiveEffects: any = null;
let pendingPassiveTransitions = null;

let rootDoesHavePassiveEffects = false;

let currentEventTransitionLane = NoLane;

const { ReactCurrentBatchConfig } = ReactSharedInternals;

export let subtreeRenderLanes = NoLanes;
let pendingPassiveEffectsLanes = NoLanes;

export const NoContext = /*             */ 0b000;
const BatchedContext = /*               */ 0b001;
const RenderContext = /*                */ 0b010;
const CommitContext = /*                */ 0b100;

let executionContext = NoContext

export function requestEventTime() {
  return performance.now();
}

export function requestUpdateLane(fiber) {
  const mode = fiber.mode;
  if ((mode & ConcurrentMode) == NoMode) {
    return SyncLane;
  }
  const isTransition = requestCurrentTransition() != NoTransition;
  if (isTransition) {
    if (ReactCurrentBatchConfig.transition != null) {
      const transition = ReactCurrentBatchConfig.transition;
      if (!transition._updatedFibers) {
        transition._updatedFibers = new Set();
      }
      transition._updatedFibers.add(fiber);
    }
    if (currentEventTransitionLane == NoLane) {
      currentEventTransitionLane = claimNextTransitionLane();
    }
    return currentEventTransitionLane;
  }

  const updateLane = getCurrentUpdatePriority();
  if (updateLane != NoLanes) {
    return updateLane;
  }

  return DefaultLane;
}

export function flushPassiveEffects() {
  if (rootWithPendingPassiveEffects != null) {
    const renderPriority = lanesToEventPriority(pendingPassiveEffectsLanes);
    const priority = lowerEventPriority(DefaultEventPriority, renderPriority);
    const previousPriority = getCurrentUpdatePriority();
    try {
      setCurrentUpdatePriority(priority);
      return flushPassiveEffectsImpl();
    } finally {
      setCurrentUpdatePriority(previousPriority);
    }
  }
}

function flushPassiveEffectsImpl() {
  if (rootWithPendingPassiveEffects == null) return false;
  const root = rootWithPendingPassiveEffects;
  const transitions = pendingPassiveTransitions;
  pendingPassiveTransitions = null;
  const lanes = pendingPassiveEffectsLanes;
  rootWithPendingPassiveEffects = null;
  pendingPassiveEffectsLanes = NoLanes;
  commitPassiveUnmountEffects(root.current);
  commitPassiveMountEffects(root, root.current, lanes, transitions);
}

export function scheduleUpdateOnFiber(fiber, lane, eventTime) {
  // todo 重写 这个方法
  const root = markUpdateLaneFromFiberToRoot(fiber, lane);
  markRootUpdated(root, lane, eventTime);

  ensureRootIsScheduled(root, eventTime);
}

function markUpdateLaneFromFiberToRoot(fiber, lane) {
  fiber.lanes = mergeLanes(fiber.lanes, lane);
  let alternate = fiber.alternate;
  if (alternate != null) {
    alternate.lanes = mergeLanes(alternate.lanes, lane);
  }
  let node = fiber;
  let parent = node.return;
  while (parent != null) {
    parent.childLanes = mergeLanes(parent.childLanes, lane);
    alternate = parent.alternate;
    if (alternate != null) {
      alternate.childLanes = mergeLanes(alternate.childLanes, lane);
    }
    node = parent;
    parent = node.return;
  }
  return node.stateNode;
}

function performSyncWorkOnRoot(root) {
  const lanes = getNextLanes(root, NoLanes);
  let exitStatus = renderRootSync(root, lanes);

  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  root.finishedLanes = lanes;
  commitRoot(root);
}

function ensureRootIsScheduled(root, currentTime) {
  const nextLanes = getNextLanes(
    root,
    root == workInProgressRoot ? workInProgressRootRenderLanes : NoLanes
  );
  let newCallbackNode;
  markStarvedLanesAsExpired(root, currentTime);
  const newCallbackPriority = getHighestPriorityLane(nextLanes);
  const existingCallbackPriority = root.callbackPriority;
  if (existingCallbackPriority == newCallbackPriority) {
    return;
  }

  var schedulerPriorityLevel;
  if (newCallbackPriority == SyncLane) {
    if (root.tag == LegacyRoot) {
    } else {
      scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
    }
    scheduleMicrotask(flushSyncCallbacks);


    
    newCallbackNode = null;
  } else {
    switch (lanesToEventPriority(nextLanes)) {
      case DefaultLane:
        schedulerPriorityLevel = NormalSchedulerPriority;
        break;
    }
    // 添加 taskQueue任务队列 level 初始化为3
    newCallbackNode = scheduleCallback(
      schedulerPriorityLevel,
      performConcurrentWorkOnRoot.bind(null, root)
    );
  }

  // root 上添加 performConcurrentWorkOnRoot callback
  root.callbackPriority = newCallbackPriority;
  root.callbackNode = newCallbackNode;
}

function performConcurrentWorkOnRoot(root, didTimeout) {
  // workLoop callback
  var lanes = getNextLanes(root, NoLanes);
  // todo movePendingFibersToMemoized()

  const exitStatus = renderRootSync(root, lanes);

  if (workInProgressRootExitStatus != RootIncomplete) {
    const finishedWork = root.current.alternate;
    root.finishedWork = finishedWork;
    root.finishedLanes = lanes;
    finishConcurrentRender(root, exitStatus, lanes);
  }
}

function handleError(root, thrownValue) {
  do {
    let erroredWork = workInProgress;
    if (
      thrownValue !== null &&
      typeof thrownValue === "object" &&
      typeof thrownValue.then === "function"
    ) {
      const wakeable = thrownValue;
    } else {
    }
    throwException(
      root,
      erroredWork.return,
      erroredWork,
      thrownValue,
      workInProgressRootRenderLanes
    );
    completeUnitOfWork(erroredWork)

    // todo
    return;
  } while (true);
}

function renderRootSync(root, lanes) {
  debugger;
  prepareFreshStack(root, lanes);
 
  do {
    try {
      workLoopSync();
      break;
    } catch (thrownValue) {
      handleError(root, thrownValue);
    }
  } while (true);
  return workInProgressRootExitStatus;
}

function prepareFreshStack(root, lanes) {
  root.finishedWork = null;
  root.finishedLanes = NoLanes;

  workInProgressRoot = root;
  workInProgress = createWorkInProgress(root.current, null);
  workInProgressRootRenderLanes = subtreeRenderLanes = lanes;
  finishQueueingConcurrentUpdates();

  return workInProgress;
}

function workLoopSync() {
  while (workInProgress != null) {
    performUnitOfWork(workInProgress);
  }
}

function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;
  let next = beginWork(current, unitOfWork, subtreeRenderLanes);

  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next == null) {
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}
let beginWork = (current, unitOfWork, lanes) => {
  try {
    return originalBeginWork(current, unitOfWork, lanes);
  } catch (originalError) {
    throw originalError;
  }
};

function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;

    if ((completedWork.flags & Incomplete) === NoFlags) {
      let next = completeWork(current, completedWork, subtreeRenderLanes);

      if (next != null) {
        // Completing this fiber spawned new work. Work on that next.
        workInProgress = next;
        return;
      }

    } else {
      const next: any = unwindWork(current, completedWork, renderLanes);
      if (next != null) {
        next.flags &= HostEffectMask;
        workInProgress = next;
        return;
      }

      if ((completedWork.mode & ProfileMode) != NoMode) {
        let child = completedWork.child;
        while (child != null) {
          child = child.sibling;
        }
      }
      if (returnFiber != null) {
        returnFiber.flags |= Incomplete;
        returnFiber.subtreeFlags = NoFlags;
        returnFiber.deletions = null;
      } else {
        workInProgressRootExitStatus = RootDidNotComplete;
        workInProgress = null;
        return;
      }

    }

    const siblingFiber = completedWork.sibling;
    if (siblingFiber != null) {
      workInProgress = siblingFiber;
      return;
    }

    completedWork = returnFiber;
    workInProgress = completedWork;

  } while (completedWork != null);

  if (workInProgressRootExitStatus == RootIncomplete) {
    workInProgressRootExitStatus = RootCompleted;
  }
}

function finishConcurrentRender(root, exitStatus, lanes) {
  switch (exitStatus) {
    case RootCompleted:
      commitRoot(root);
      break;
    case RootSuspended:
      commitRoot(root);
      break;
  }
}

function commitRoot(root) {
  const previousUpdateLanePriority = getCurrentUpdatePriority();
  try {
    setCurrentUpdatePriority(DiscreteEventPriority);
    commitRootImpl(root, previousUpdateLanePriority);
    return null;
  } finally {
    setCurrentUpdatePriority(previousUpdateLanePriority);
  }
}

function commitRootImpl(root, renderPriorityLevel) {
  const finishedWork = root.finishedWork;
  const lanes = root.finishedLanes;
  root.finishedWork = null;
  root.finishedLanes = NoLanes;
  root.callbackPriority = NoLane;

  //todo 任务队列 useEffect 挂载和删除
  if (
    (finishedWork.subtreeFlags & PassiveMask) != NoFlags ||
    (finishedWork.flags & PassiveMask) != NoFlags
  ) {
    if (!rootDoesHavePassiveEffects) {
      rootDoesHavePassiveEffects = true;

      scheduleCallback(NormalSchedulerPriority, () => {
        flushPassiveEffects();
        return null;
      });
    }
  }
  let remainingLanes = mergeLanes(finishedWork.lanes, finishedWork.childLanes);

  const concurrentlyUpdatedLanes = getConcurrentlyUpdatedLanes();
  remainingLanes = mergeLanes(remainingLanes, concurrentlyUpdatedLanes);
  markRootFinished(root, remainingLanes);

  commitBeforeMutationEffects(root, finishedWork);
  commitMutationEffects(root, finishedWork, lanes);
  root.current = finishedWork;

  commitLayoutEffects(finishedWork, root, lanes);

  const rootDidHavePassiveEffects = rootDoesHavePassiveEffects;
  if (rootDidHavePassiveEffects) {
    rootDoesHavePassiveEffects = false;
    rootWithPendingPassiveEffects = root;
    pendingPassiveEffectsLanes = lanes;
  }

  
  ensureRootIsScheduled(root, now());
  if (includesSomeLane(pendingPassiveEffectsLanes, SyncLane)) {
    flushPassiveEffects();
  }

  flushSyncCallbacks();
  // onCommitRoot(finishedWork.stateNode, renderPriorityLevel);
}


export function pingSuspendedRoot(root, wakeable, pingedLanes) {

  const pingCache = root.pingCache;
  if (pingCache !== null) {
    pingCache.delete(wakeable);
  }

  const eventTime = requestEventTime();

  ensureRootIsScheduled(root, eventTime)
}


export function resolveRetryWakeable(boundaryFiber, wakeable) {
  
  let retryLane = NoLane;
  let retryCache
  switch (boundaryFiber.tag) {
    case SuspenseComponent:
      retryCache = boundaryFiber.stateNode;
      const suspenseState = boundaryFiber.memoizedState;
      if (suspenseState !== null) {
        retryLane = suspenseState.retryLane;
      }
      break;


    case SuspenseListComponent:
      retryCache = boundaryFiber.stateNode;
      break;
    case OffscreenComponent: {
      const instance = boundaryFiber.stateNode;
      retryCache = instance.retryCache;
      break;
    }
    default:

  }

  if (retryCache != null) {
    retryCache.delete(wakeable);
  }

  retryTimedOutBoundary(boundaryFiber, retryLane);
}

export function renderDidSuspend() {
  if (workInProgressRootExitStatus === RootInProgress) {
    workInProgressRootExitStatus = RootSuspended;
  }
}


export function restorePendingUpdaters(root, lane) {

}
function retryTimedOutBoundary(boundaryFiber, retryLane){
  if(retryLane == NoLane){
    retryLane = requestRetryLane(boundaryFiber)
  }
  const eventTime = requestEventTime();
  const root = enqueueConcurrentRenderForLane(boundaryFiber, retryLane);
  if (root !== null) {
    markRootUpdated(root, retryLane, eventTime)
    ensureRootIsScheduled(root, eventTime);
  }

}

function requestRetryLane(fiber){
  const mode = fiber.mode;
  if((mode & ConcurrentMode) == NoMode){
    return SyncLane
  }
  return claimNextRetryLane()
}

export function isUnsafeClassRenderPhaseUpdate(fiber){
  return (fiber.mode & ConcurrentMode) == NoMode  && (executionContext & RenderContext) !== NoContext
}

export function getWorkInProgressRoot(){
  return workInProgressRoot;
}

