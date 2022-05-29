export const NoLanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane= /*                          */ 0b0000000000000000000000000000000;

export const SyncLane= /*                        */ 0b0000000000000000000000000000001;

export const InputContinuousHydrationLane = /*    */ 0b0000000000000000000000000000010;
export const InputContinuousLane = /*            */ 0b0000000000000000000000000000100;

export const DefaultHydrationLane = /*            */ 0b0000000000000000000000000001000;
export const DefaultLane = /*                    */ 0b0000000000000000000000000010000;

const NonIdleLanes = /*                                 */ 0b0001111111111111111111111111111;

export function mergeLanes(a, b) {
  return a | b;
}

export function markRootUpdated(root, lane, eventTime){
  root.pendingLanes |= lane
  laneToIndex(lane)
  // todo  eventTimes 添加时间
}


function laneToIndex(lane) {
  return pickArbitraryLaneIndex(lane)
}

function pickArbitraryLaneIndex(lane){
  return 31 - Math.clz32(lane)
}

export function markStarvedLanesAsExpired(root, currentTime){
  var pendingLanes = root.pendingLanes;
  const expirationTimes = root.expirationTimes;
  var lanes = pendingLanes;
  while(lanes > 0){
    var index = pickArbitraryLaneIndex(lanes)
    // expirationTimes[index] = computeExpirationTime(lane, currentTime);
    var lane = 1 << index
    lanes &= ~lane 
  }
  
}


export function getHighestPriorityLane(lane){
  return lane & -lane
}

export function getNextLanes(root,lane?:number){
  const pendingLanes = root.pendingLanes 
  const nonIdlePendingLanes = pendingLanes & NonIdleLanes
  const nextLanes = getHighestPriorityLane(nonIdlePendingLanes)
  return nextLanes
}

export function markRootFinished(root,remainingLanes){
  root.pendingLanes = 0;
}

export function includesSomeLane(a,b){
  return (a & b) != NoLanes
}