import { mergeLanes, NoLane, NoLanes } from "./ReactFiberLane";
import { HostRoot } from "./ReactWorkTags";
const concurrentQueues:any[] = []
let concurrentQueuesIndex = 0
let concurrentlyUpdatedLanes = NoLane

function enqueueUpdate(fiber,queue,update,lane){
  concurrentQueues[concurrentQueuesIndex++] = fiber
  concurrentQueues[concurrentQueuesIndex++] = queue
  concurrentQueues[concurrentQueuesIndex++] = update
  concurrentQueues[concurrentQueuesIndex++] = lane
  concurrentlyUpdatedLanes = mergeLanes(concurrentlyUpdatedLanes,lane)
  fiber.lanes = mergeLanes(fiber.lanes, lane);
  const alternate = fiber.alternate;
  if (alternate != null) {
    alternate.lanes = mergeLanes(alternate.lanes, lane);
  }

}

export function enqueueConcurrentHookUpdate(fiber,quene,update,lane){
  const concurrentQueue = quene
  const concurrentUpdate = update
  enqueueUpdate(fiber,concurrentQueue,concurrentUpdate,lane)
  return getRootForUpdatedFiber(fiber)
  
}



function getRootForUpdatedFiber(sourceFiber){
  let node = sourceFiber;
  let parent = node.return;
  while (parent != null) {
    node = parent;
    parent = node.return;
  }
  return node.tag == HostRoot ? node.stateNode : null
}


export function finishQueueingConcurrentUpdates(){
  const endIndex = concurrentQueuesIndex;
  concurrentQueuesIndex = 0;
  concurrentlyUpdatedLanes = NoLanes;
  let i = 0;

  while (i < endIndex) {
    const fiber = concurrentQueues[i]
    concurrentQueues[i++] = null;
    const queue = concurrentQueues[i];
    concurrentQueues[i++] = null;
    const update = concurrentQueues[i]
    concurrentQueues[i++] = null;
    const lane = concurrentQueues[i];
    concurrentQueues[i++] = null;

    if (queue != null && update != null) {
      const pending = queue.pending;
      if (pending == null) {
        update.next = update;
      }else{
        update.next = pending.next;
        pending.next = update;
      }
      queue.pending = update;
    }

    if(lane != NoLane){
      markUpdateLaneFromFiberToRoot(fiber,update,lane)
    }

  }
}


function markUpdateLaneFromFiberToRoot(sourceFiber,update,lane){
  sourceFiber.lanes = mergeLanes(sourceFiber.lanes, lane);
  let alternate = sourceFiber.alternate;
  if (alternate != null) {
    alternate.lanes = mergeLanes(alternate.lanes, lane);
  }

  let isHidden = false;
  let parent = sourceFiber.return;
  let node = sourceFiber;


  while (parent != null) {
    parent.childLanes = mergeLanes(parent.childLanes, lane);
    alternate = parent.alternate;
    if (alternate != null) {
      alternate.childLanes = mergeLanes(alternate.childLanes, lane);
    }



    node = parent;
    parent = parent.return;
  }
}