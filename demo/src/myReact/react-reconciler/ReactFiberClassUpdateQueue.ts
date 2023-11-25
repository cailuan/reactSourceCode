import { isTransitionLane } from "./ReactFiberLane";

let hasForceUpdate = false;

export function entangleTransitions(root, fiber, lane){
    const updateQueue = fiber.updateQueue;
  if (updateQueue == null) {
    // Only occurs if the fiber has been unmounted.
    return;
  }
  const sharedQueue = updateQueue.shared;
  if(isTransitionLane(lane)){

  }

}

export function resetHasForceUpdateBeforeProcessing(){
    hasForceUpdate = false;
}

export function checkHasForceUpdateAfterProcessing(): boolean {
  return hasForceUpdate;
}