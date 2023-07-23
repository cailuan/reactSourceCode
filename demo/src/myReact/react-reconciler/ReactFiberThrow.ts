import { ForceClientRender, Incomplete, ShouldCapture } from "./ReactFiberFlags";
import { getSuspenseHandler } from "./ReactFiberSuspenseContext";
import { pingSuspendedRoot } from "./ReactFiberWorkLoop";
import { ConcurrentMode } from "./ReactTypeOfMode";
import { SuspenseComponent } from "./ReactWorkTags";

const PossiblyWeakMap = typeof WeakMap === "function" ? WeakMap : Map;

export function throwException(
  root,
  returnFiber,
  sourceFiber,
  value,
  rootRenderLanes
) {
  sourceFiber.flags |= Incomplete;
  if (
    value != null &&
    typeof value === "object" &&
    typeof value.then === "function"
  ) {
    const wakeable = value;
    
    debugger
    const suspenseBoundary = getSuspenseHandler();
    if (suspenseBoundary != null) {
      switch (suspenseBoundary.tag) {
        case SuspenseComponent: {
          suspenseBoundary.flags &= ~ForceClientRender;

          markSuspenseBoundaryShouldCapture(suspenseBoundary, returnFiber, sourceFiber, root, rootRenderLanes);
          const wakeables = suspenseBoundary.updateQueue;

          if (wakeables == null) {
            suspenseBoundary.updateQueue = new Set([wakeable]);
          } else {
            wakeables.add(wakeable);
          }
          break;
        }
      }

      if (suspenseBoundary.mode & ConcurrentMode) {
        attachPingListener(root, wakeable, rootRenderLanes);
      }
    }
  }
}

function attachPingListener(root, wakeable, lanes) {
  let pingCache = root.pingCache;
  let threadIDs;
  if (pingCache == null) {
    pingCache = root.pingCache = new WeakMap();
    threadIDs = new Set();
    pingCache.set(wakeable, threadIDs);
  } else {
    threadIDs = pingCache.get(wakeable);
    if (threadIDs === undefined) {
      threadIDs = new Set();
      pingCache.set(wakeable, threadIDs);
    }
  }

  if (!threadIDs.has(lanes)) {
    threadIDs.add(lanes);
    let ping = pingSuspendedRoot.bind(null, root, wakeable, lanes);
    wakeable.then(ping, ping);
  }
}


function markSuspenseBoundaryShouldCapture(suspenseBoundary,returnFiber, sourceFiber, root,rootRenderLanes){
  suspenseBoundary.flags |= ShouldCapture;
  suspenseBoundary.lanes = rootRenderLanes;
  return suspenseBoundary;
}