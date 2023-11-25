import { mergeLanes } from "./ReactFiberLane";
import { HostRoot } from "./ReactWorkTags";

let concurrentQueues 
export function enqueueConcurrentClassUpdate(
    fiber,
  queue,
  update,
  lane
){

    const interleaved = queue.interleaved;
    if (interleaved == null) {
        update.next = update;
        pushConcurrentUpdateQueue(queue);
    }else{
        update.next = interleaved.next;
        interleaved.next = update;
    }

    queue.interleaved = update;

  return markUpdateLaneFromFiberToRoot(fiber, lane);

}

function markUpdateLaneFromFiberToRoot(sourceFiber, lane){
    sourceFiber.lanes = mergeLanes(sourceFiber.lanes, lane);
    let alternate = sourceFiber.alternate;
  if (alternate != null) {
    alternate.lanes = mergeLanes(alternate.lanes, lane);
  }

  let node = sourceFiber;
  let parent = sourceFiber.return;

  while (parent != null) {
    parent.childLanes = mergeLanes(parent.childLanes, lane);
    alternate = parent.alternate;
    if (alternate != null) {
      alternate.childLanes = mergeLanes(alternate.childLanes, lane);
    } else {
     
    }
    node = parent;
    parent = parent.return;
  }

  if (node.tag == HostRoot) {
    const root = node.stateNode;
    return root;
  } else {
    return null;
  }
}

export function pushConcurrentUpdateQueue(queue){
    if(concurrentQueues == null){
        concurrentQueues = [queue]
    }else {
        concurrentQueues.push(queue)
    }
}