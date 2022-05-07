import { DefaultLane, getHighestPriorityLane } from "./ReactFiberLane";

export function lanesToEventPriority(lanes){
  const lane = getHighestPriorityLane(lanes)
  return DefaultLane
}