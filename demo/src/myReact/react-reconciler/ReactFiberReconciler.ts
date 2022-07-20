import { findCurrentHostFiberWithNoPortals } from "../shared/ReactInstanceMap";
import { createFiberRoot } from "./ReactFiberRoot";
import { requestEventTime, requestUpdateLane ,scheduleUpdateOnFiber} from "./ReactFiberWorkLoop";
import { createUpdate, enqueueUpdate } from "./ReactUpdateQueue";


export function createContainer(container,tag){
  return createFiberRoot(container,tag)
}

export function findHostInstanceWithNoPortals(fiber){
  const hostFiber:any =  findCurrentHostFiberWithNoPortals(fiber)
  if(hostFiber == null) return null
  return hostFiber.stateNode;
}



export function updateContainer(element,container){
  // todo onScheduleRoot  oldOnScheduleFiberRoot apply
  const current = container.current;
  const eventTime = requestEventTime();
  var lane = requestUpdateLane(current)
  // 当前节点更新到 current.updateQueue.shared.pending.payload.element 上
  var update:any =  createUpdate(eventTime,lane)
  update.payload = {
    element
  }
  enqueueUpdate(current,update)
  scheduleUpdateOnFiber(current,lane,eventTime)

  
}