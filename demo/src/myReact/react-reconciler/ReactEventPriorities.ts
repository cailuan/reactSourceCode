import { DefaultLane, getHighestPriorityLane, NoLane, SyncLane } from "./ReactFiberLane";

let currentUpdatePriority = NoLane
export function lanesToEventPriority(lanes){
  const lane = getHighestPriorityLane(lanes)
  return DefaultLane
}

export function getCurrentUpdatePriority(){
  return currentUpdatePriority
}

export function setCurrentUpdatePriority(newPriority){
  currentUpdatePriority =  newPriority
}
export const DiscreteEventPriority = SyncLane
