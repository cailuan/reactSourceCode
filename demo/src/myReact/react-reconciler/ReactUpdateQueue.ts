import { NoLanes } from "./ReactFiberLane";



export const UpdateState = 0;
export const ReplaceState = 1;
export const ForceUpdate = 2;
export const CaptureUpdate = 3;

export function initializeUpdateQueue(fiber){
  const quene = {
    baseState:fiber.memoizedState,
    firstBaseUpdate : null,
    lastBaseUpdate: null,
    shared:{
      pending:null,
      lanes: NoLanes
      
    },
    effects:null
  }
  fiber.updateQueue = quene
}


export function createUpdate(eventTime,lane){
  const update = {
    eventTime,
    lane,

    tag: UpdateState,
    payload: null,
    callback: null,

    next: null,
  };
  return update;
}

export function enqueueUpdate(fiber,update){
  const updateQueue = fiber.updateQueue
  const sharedQueue = updateQueue.shared

  const pending = sharedQueue.pending;
  if(pending == null){
    update.next = update
  }


  sharedQueue.pending = update

}

export function cloneUpdateQueue(current,workInProgress){
  const quene = workInProgress.updateQueue
  const currentQueue = current.updateQueue
  if(quene == currentQueue){
    const clone = {
      baseState : currentQueue.baseState,
      firstBaseUpdate : currentQueue.firstBaseUpdate,
      lastBaseUpdate: currentQueue.lastBaseUpdate,
      shared: currentQueue.shared,
      effects: currentQueue.effects
    }
    workInProgress.updateQueue = clone;
  }
}

export function processUpdateQueue(workInProgress,props,instance,renderLanes){
  const queue = workInProgress.updateQueue
  let firstBaseUpdate = queue.firstBaseUpdate;
  let lastBaseUpdate = queue.lastBaseUpdate;
  let pendingQueue = queue.shared.pending;
  if(pendingQueue != null){
    queue.shared.pending = null;
    const lastPendingUpdate =  pendingQueue
    const firstPendingUpdate =  pendingQueue.next
    lastPendingUpdate.next = null
    if(lastBaseUpdate == null){
      firstBaseUpdate = firstPendingUpdate;
    }else {
      lastBaseUpdate.next = firstPendingUpdate
    }
    lastBaseUpdate = lastPendingUpdate;

    const current = workInProgress.alternate;
    if(current != null){
      const currentQueue = current.updateQueue
      const currentLastBaseUpdate = currentQueue.lastBaseUpdate
      if(currentLastBaseUpdate != lastBaseUpdate){
        if(currentLastBaseUpdate == null){
          currentQueue.firstBaseUpdate = firstPendingUpdate
        }else{
          currentLastBaseUpdate.next = firstPendingUpdate
        }
        currentQueue.lastBaseUpdate = lastPendingUpdate
      }
    }
  }

  if(firstBaseUpdate != null){
    let newLastBaseUpdate = null;
    let newBaseState = null
    let update = firstBaseUpdate
    let newState = queue.baseState
    let newFirstBaseUpdate = null
    do{
      
      newState =  getStateFromUpdate(workInProgress,queue,update,newState,props,instance)
      let callback = update.callback
      update = update.next
      if(update == null){
        pendingQueue = queue.shared.pending;
        if(pendingQueue == null){
          break
        }else{
          let lastPendingUpdate = pendingQueue
          const firstPendingUpdate = lastPendingUpdate.next
          lastPendingUpdate.next = null;
          update = firstPendingUpdate;
          queue.lastBaseUpdate = lastPendingUpdate;
          queue.shared.pending = null;
        }
      }
    }while(true)

    if(newLastBaseUpdate == null){
      newBaseState = newState
    }

    queue.baseState = newBaseState
    queue.firstBaseUpdate = newFirstBaseUpdate;
    queue.lastBaseUpdate = newLastBaseUpdate;
    workInProgress.lanes = NoLanes
    workInProgress.memoizedState = newState

  }


  
  

}

function getStateFromUpdate(workInProgress,queue,update,prevState,nextProps,instance){
  switch(update.tag){
    case UpdateState:
      const _payload = update.payload
      let partialState = _payload
      return Object.assign({},prevState,partialState)
  }
}