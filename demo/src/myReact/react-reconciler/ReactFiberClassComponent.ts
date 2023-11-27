import * as React from "../react"
import { emptyContextObject } from "./ReactFiberContext";
import { set as setInstance , get as getInstance } from "../shared/ReactInstanceMap";
import { cloneUpdateQueue, createUpdate, enqueueUpdate, initializeUpdateQueue, processUpdateQueue } from "./ReactUpdateQueue";
import { NoLanes } from "./ReactFiberLane";
import { requestEventTime, requestUpdateLane, scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";
import { checkHasForceUpdateAfterProcessing, entangleTransitions  , resetHasForceUpdateBeforeProcessing} from "./ReactFiberClassUpdateQueue";
import { disableLegacyContext , enableLazyContextPropagation} from "../shared/ReactFeatureFlags";
import { LayoutStatic, Update } from "./ReactFiberFlags";

const fakeInternalInstance = {};
export const emptyRefsObject = new React.Component().refs

function constructClassInstance(workInProgress, ctor,props){
  let isLegacyContextConsumer = false;
  let unmaskedContext = emptyContextObject;
  let context = emptyContextObject;
  const contextType = ctor.contextType;
  let instance =  new ctor(props, context);
  
  const state = (workInProgress.memoizedState = instance.state != null ? instance.state : null);
  adoptClassInstance(workInProgress, instance);

  if(typeof ctor.getDerivedStateFromProps == 'function' && typeof ctor.getSnapshotBeforeUpdate == 'function'){
    let foundWillMountName ;
    let foundWillReceivePropsName ;
    let foundWillUpdateName;

    if(typeof instance.componentWillMount == 'function' && instance.componentWillMount.__suppressDeprecationWarning != true ){
        foundWillMountName = 'componentWillMount';
    }else if (typeof instance.UNSAFE_componentWillMount == 'function') {
        foundWillMountName = 'UNSAFE_componentWillMount';
    }

    if (typeof instance.componentWillReceiveProps == 'function' && instance.componentWillReceiveProps.__suppressDeprecationWarning != true) {
        foundWillReceivePropsName = 'componentWillReceiveProps';
      } else if (typeof instance.UNSAFE_componentWillReceiveProps == 'function') {
        foundWillReceivePropsName = 'UNSAFE_componentWillReceiveProps';
      }

      if (typeof instance.componentWillUpdate == 'function' && instance.componentWillUpdate.__suppressDeprecationWarning != true) {
        foundWillUpdateName = 'componentWillUpdate';
      } else if (typeof instance.UNSAFE_componentWillUpdate == 'function') {
        foundWillUpdateName = 'UNSAFE_componentWillUpdate';
      }

      if (
        foundWillMountName != null ||
        foundWillReceivePropsName != null ||
        foundWillUpdateName != null
      ) {

      }
      if(isLegacyContextConsumer){

      }
      return instance;

  }
}


function adoptClassInstance(workInProgress, instance){
    instance.updater = classComponentUpdater;
    workInProgress.stateNode = instance;
    setInstance(instance, workInProgress);

    instance._reactInternalInstance = fakeInternalInstance;
}

const classComponentUpdater = {
    enqueueSetState(inst, payload, callback){
        const fiber = getInstance(inst);
        const eventTime = requestEventTime();
        
        const lane = requestUpdateLane(fiber);
        
        const update = createUpdate(eventTime, lane);

        update.payload = payload;
        if(callback != null){
            update.callback = callback;
        }
         enqueueUpdate(fiber, update, lane);
         const root = scheduleUpdateOnFiber( fiber,lane , eventTime);
        if(root != null){
            
            entangleTransitions(root, fiber, lane);
            
        }
    }
}

function mountClassInstance(workInProgress, ctor, newProps, renderLanes){
    const instance = workInProgress.stateNode;
  instance.props = newProps;
  instance.state = workInProgress.memoizedState;
  instance.refs = emptyRefsObject;

  initializeUpdateQueue(workInProgress);

  const contextType = ctor.contextType;

  instance.state = workInProgress.memoizedState;

  const getDerivedStateFromProps = ctor.getDerivedStateFromProps;

  if( typeof getDerivedStateFromProps == 'function') {
   
    applyDerivedStateFromProps(
        workInProgress,
        ctor,
        getDerivedStateFromProps,
        newProps,
      );
    instance.state = workInProgress.memoizedState;
  }

  if(typeof instance.componentDidMount == 'function' ){ 
    let fiberFlags = Update;
    fiberFlags |= LayoutStatic

    workInProgress.flags |= fiberFlags;
  }

}

function applyDerivedStateFromProps(workInProgress, ctor, getDerivedStateFromProps , nextProps){
    const prevState = workInProgress.memoizedState;

    let partialState = getDerivedStateFromProps(nextProps ,prevState);

    const memoizedState = prevState == null ? prevState : Object.assign({}, prevState, partialState);

    workInProgress.memoizedState = memoizedState;

    
    if (workInProgress.lanes == NoLanes) {
        // Queue is always non-null for classes
        const updateQueue = (workInProgress.updateQueue);
        updateQueue.baseState = memoizedState;
      }
}

function resumeMountClassInstance(workInProgress, ctor, newProps, renderLanes){
    debugger
}

function updateClassInstance(current, workInProgress, ctor, newProps, renderLanes){
    const instance = workInProgress.stateNode;
    cloneUpdateQueue(current,workInProgress);
    const unresolvedOldProps = workInProgress.memoizedProps;

    const oldProps = unresolvedOldProps;

    instance.props = oldProps;
    const unresolvedNewProps = workInProgress.pendingProps;
    const oldContext = instance.context;
    const contextType = ctor.contextType;
    let nextContext = emptyContextObject;

    if(!disableLegacyContext){}

    const getDerivedStateFromProps = ctor.getDerivedStateFromProps;
    const hasNewLifecycles =
      typeof getDerivedStateFromProps == 'function' ||
      typeof instance.getSnapshotBeforeUpdate == 'function';

    //.  todo
    resetHasForceUpdateBeforeProcessing();

    const oldState = workInProgress.memoizedState;
    let newState = (instance.state = oldState);
    processUpdateQueue(workInProgress, newProps, instance,renderLanes);
    newState = workInProgress.memoizedState;


    if(unresolvedOldProps == unresolvedNewProps && oldState == newState && !(
        enableLazyContextPropagation && current != null && current.dependencies != null
    ) ) {

        if(typeof instance.componentDidUpdate == 'function'){
            if(unresolvedOldProps != current.memoizedProps || oldState != current.memoizedState){
                workInProgress.flags |= Update;
            }
        }
        return false;
    }

    const shouldUpdate = checkHasForceUpdateAfterProcessing() || checkShouldComponentUpdate(
        workInProgress,
        ctor,
        oldProps,
        newProps,
        oldState,
        newState,
        nextContext,
      )

    if(shouldUpdate){
        if(typeof instance.componentDidUpdate == 'function'){
            workInProgress.flags |= Update
        }
    }else {
        if (typeof instance.componentDidUpdate === 'function') {
            if (
              unresolvedOldProps !== current.memoizedProps ||
              oldState !== current.memoizedState
            ) {
              workInProgress.flags |= Update;
            }
        }
        workInProgress.memoizedProps = newProps;
        workInProgress.memoizedState = newState;
    }


    instance.props = newProps;
    instance.state = newState;
    instance.context = nextContext;
  
    return shouldUpdate;

}

function checkShouldComponentUpdate(
    workInProgress,
    ctor,
    oldProps,
    newProps,
    oldState,
    newState,
    nextContext,
){
    const instance = workInProgress.stateNode;
    return true;
}

export {constructClassInstance , adoptClassInstance, mountClassInstance,updateClassInstance, resumeMountClassInstance,  classComponentUpdater};