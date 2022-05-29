import { DiscreteEventPriority, getCurrentUpdatePriority, setCurrentUpdatePriority } from "../../react-reconciler/ReactEventPriorities";

let isInsideEventHandler = false;
let isBatchingEventUpdates = false;

function finishEventHandler(){}
let batchedUpdatesImpl = function(fn, bookkeeping,c?:any) {
  return fn(bookkeeping);
};
let batchedEventUpdatesImpl = batchedUpdatesImpl;

let discreteUpdatesImpl = function(fn, a, b, c, d) {
  // react-dom/src/events/ReactDOMUpdateBatching.js discreteUpdates
  const previousPriority =  getCurrentUpdatePriority()
  try{
    setCurrentUpdatePriority(DiscreteEventPriority)
    return fn(a, b, c, d);
  } finally{
    setCurrentUpdatePriority(previousPriority)
  }
  
};


export function discreteUpdates(fn,a,b,c,d){
  const prevIsInsideEventHandler = isInsideEventHandler;
  isInsideEventHandler = true;
  try{
    return discreteUpdatesImpl(fn,a,b,c,d)
  }finally{
    isInsideEventHandler = prevIsInsideEventHandler;
    if (!isInsideEventHandler) {
      finishEventHandler();
    }
  }
}

export function batchedEventUpdates(fn,a?:any,b?:any){
  if(isBatchingEventUpdates){
    return fn(a,b)
  }
  isBatchingEventUpdates = true;
  try{
    return batchedEventUpdatesImpl(fn,a,b)
  }finally{
    isBatchingEventUpdates = false;
    finishEventHandler()
  }
}



