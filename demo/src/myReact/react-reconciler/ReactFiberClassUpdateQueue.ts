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

function callCallback(callback, context) {
  if (typeof callback != 'function') {
    throw new Error(
      'Invalid argument passed as callback. Expected a function. Instead ' +
        `received: ${callback}`,
    );
  }

  callback.call(context);
}

export function commitUpdateQueue(finishedWork ,finishedQueue, instance){
  const effects = finishedQueue.effects;
  finishedQueue.effects = null;
  if (effects != null) {
    for (let i = 0; i < effects.length; i++) {
      const effect = effects[i];
      const callback = effect.callback;
      if (callback != null) {
        effect.callback = null;
        callCallback(callback, instance);
      }
    }
  }
}