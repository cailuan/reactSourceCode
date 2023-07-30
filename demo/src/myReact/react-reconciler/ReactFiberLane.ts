export const NoLanes = /*                        */ 0b0000000000000000000000000000000;
export const NoLane = /*                          */ 0b0000000000000000000000000000000;

export const SyncLane = /*                        */ 0b0000000000000000000000000000001;

export const InputContinuousHydrationLane = /*    */ 0b0000000000000000000000000000010;
export const InputContinuousLane = /*            */ 0b0000000000000000000000000000100;

export const DefaultHydrationLane = /*            */ 0b0000000000000000000000000001000;
export const DefaultLane = /*                    */ 0b0000000000000000000000000010000;

const NonIdleLanes = /*                                 */ 0b0001111111111111111111111111111;

const TransitionLanes = /*                       */ 0b0000000001111111111111111000000;
const TransitionLane1 = /*                        */ 0b0000000000000000000000001000000;


const RetryLanes = /*                             */ 0b0000111110000000000000000000000;
const RetryLane1 = /*                             */ 0b0000000010000000000000000000000;
const RetryLane2 = /*                             */ 0b0000000100000000000000000000000;
const RetryLane3 = /*                             */ 0b0000001000000000000000000000000;
const RetryLane4 = /*                             */ 0b0000010000000000000000000000000;
const RetryLane5 = /*                             */ 0b0000100000000000000000000000000;


export const NoTimestamp = -1;

let nextTransitionLane = TransitionLane1;
let nextRetryLane = RetryLane1;

export function mergeLanes(a, b) {
  return a | b;
}

export function markRootUpdated(root, lane, eventTime) {
  root.pendingLanes |= lane
  laneToIndex(lane)
  // todo  eventTimes 添加时间
}


function laneToIndex(lane) {
  return pickArbitraryLaneIndex(lane)
}

function pickArbitraryLaneIndex(lane) {
  return 31 - Math.clz32(lane)
}

export function markStarvedLanesAsExpired(root, currentTime) {
  var pendingLanes = root.pendingLanes;
  const expirationTimes = root.expirationTimes;
  var lanes = pendingLanes;
  while (lanes > 0) {
    var index = pickArbitraryLaneIndex(lanes)
    // expirationTimes[index] = computeExpirationTime(lane, currentTime);
    var lane = 1 << index
    lanes &= ~lane
  }

}


export function getHighestPriorityLane(lane) {
  return lane & -lane
}

export function getNextLanes(root, lane?: number) {
  const pendingLanes = root.pendingLanes
  const nonIdlePendingLanes = pendingLanes & NonIdleLanes
  const nextLanes = getHighestPriorityLane(nonIdlePendingLanes)
  return nextLanes
}

export function markRootFinished(root, remainingLanes) {
  root.pendingLanes = remainingLanes;
}

export function includesSomeLane(a, b) {
  return (a & b) != NoLanes
}

export function removeLanes(set, subset) {
  return set & ~subset;
}

export function claimNextTransitionLane() {
  const lane = nextTransitionLane;
  nextTransitionLane <<= 1;
  if ((nextTransitionLane & TransitionLanes) === NoLanes) {
    nextTransitionLane = TransitionLane1;
  }

  return lane;
}


export function isSubsetOfLanes(set, subset) {
  return (set & subset) == subset;
}

export function isTransitionLane(lane) {
  return (lane & TransitionLanes) != NoLanes
}

export function intersectLanes(a, b) {
  return a & b;
}

export function claimNextRetryLane() {
  const lane = nextRetryLane;
  nextRetryLane <<= 1;
  if ((nextRetryLane & RetryLanes) === NoLanes) {
    nextRetryLane = RetryLane1;
  }
  return lane;
}

export function includesOnlyNonUrgentLanes(lanes) {
  const UrgentLanes = SyncLane | InputContinuousLane | DefaultLane;
  return (lanes & UrgentLanes) === NoLanes;
}

export function includesBlockingLane(root, lanes) {
  const SyncDefaultLanes =
    InputContinuousHydrationLane |
    InputContinuousLane |
    DefaultHydrationLane |
    DefaultLane;
  return (lanes & SyncDefaultLanes) !== NoLanes;
}