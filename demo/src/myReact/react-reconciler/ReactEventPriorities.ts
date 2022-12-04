import { DefaultLane, getHighestPriorityLane, NoLane, SyncLane ,InputContinuousLane} from "./ReactFiberLane";

export const ContinuousEventPriority = InputContinuousLane;

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

export function lowerEventPriority(a,b){
  return a == 0 || a > b ? a : b;
}

export const DefaultEventPriority = DefaultLane



export const DiscreteEventPriority = SyncLane


export function higherEventPriority(a,b){
  return a != 0 && a < b ? a : b
}