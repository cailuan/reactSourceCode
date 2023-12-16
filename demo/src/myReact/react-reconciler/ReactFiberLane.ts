export const NoLanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane= /*                          */ 0b0000000000000000000000000000000;

export const SyncLane= /*                        */ 0b0000000000000000000000000000001;

export const InputContinuousHydrationLane = /*    */ 0b0000000000000000000000000000010;
export const InputContinuousLane = /*            */ 0b0000000000000000000000000000100;

export const DefaultHydrationLane = /*            */ 0b0000000000000000000000000001000;
export const DefaultLane = /*                    */ 0b0000000000000000000000000010000;

const TransitionHydrationLane =   0b0000000000000000000000000100000;
const TransitionLanes  =   0b0000000001111111111111111000000;
const TransitionLane1 =   0b0000000000000000000000001000000;
const TransitionLane2 =   0b0000000000000000000000010000000;
const TransitionLane3 =   0b0000000000000000000000100000000;
const TransitionLane4 =   0b0000000000000000000001000000000;
const TransitionLane5 =   0b0000000000000000000010000000000;
const TransitionLane6 =   0b0000000000000000000100000000000;
const TransitionLane7 =   0b0000000000000000001000000000000;
const TransitionLane8 =   0b0000000000000000010000000000000;
const TransitionLane9 =   0b0000000000000000100000000000000;
const TransitionLane10 =   0b0000000000000001000000000000000;
const TransitionLane11 =   0b0000000000000010000000000000000;
const TransitionLane12 =   0b0000000000000100000000000000000;
const TransitionLane13 =   0b0000000000001000000000000000000;
const TransitionLane14 =   0b0000000000010000000000000000000;
const TransitionLane15 =   0b0000000000100000000000000000000;
const TransitionLane16 =   0b0000000001000000000000000000000;

const NonIdleLanes = /*                                 */ 0b0001111111111111111111111111111;


let nextTransitionLane = TransitionLane1;
export const NoTimestamp = -1;

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
  const noLongerPendingLanes = root.pendingLanes & ~remainingLanes;

  root.pendingLanes = remainingLanes;
  root.suspendedLanes = NoLanes;
  root.pingedLanes = NoLanes;

  root.expiredLanes &= remainingLanes;
  root.mutableReadLanes &= remainingLanes;

  root.entangledLanes &= remainingLanes;

  const entanglements = root.entanglements;
  const eventTimes = root.eventTimes;
  const expirationTimes = root.expirationTimes;
  let lanes = noLongerPendingLanes;
  while (lanes > 0) {
    const index = pickArbitraryLaneIndex(lanes);
    const lane = 1 << index;

    // entanglements[index] = NoLanes;
    // eventTimes[index] = NoTimestamp;
    // expirationTimes[index] = NoTimestamp;

    lanes &= ~lane;
  }


}

export function includesSomeLane(a,b){
  return (a & b) != NoLanes
}

export function removeLanes(set,subset){
  return set & ~subset;
}

export function isTransitionLane(lane) {
  return (lane & TransitionLanes) != NoLanes;
}

export function isSubsetOfLanes(set, subset) {
  return (set & subset) == subset;
}

export function claimNextTransitionLane(){
  const lane = nextTransitionLane;
  nextTransitionLane <<= 1;
  if ((nextTransitionLane & TransitionLanes) == NoLanes) {
    nextTransitionLane = TransitionLane1;
  }
  return lane;
}

export function includesOnlyNonUrgentLanes(lanes){
  const UrgentLanes = SyncLane | InputContinuousLane | DefaultLane;
  return  (lanes & UrgentLanes) === NoLanes;
}