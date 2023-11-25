import * as React from "../react"
import { emptyContextObject } from "./ReactFiberContext";
import { set as setInstance } from "../shared/ReactInstanceMap";
import { initializeUpdateQueue } from "./ReactUpdateQueue";

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

    if(typeof instance.componentWillMount == 'function' && instance.componentWillMount.__suppressDeprecationWarning !== true ){
        foundWillMountName = 'componentWillMount';
    }else if (typeof instance.UNSAFE_componentWillMount === 'function') {
        foundWillMountName = 'UNSAFE_componentWillMount';
    }

    if (typeof instance.componentWillReceiveProps === 'function' && instance.componentWillReceiveProps.__suppressDeprecationWarning !== true) {
        foundWillReceivePropsName = 'componentWillReceiveProps';
      } else if (typeof instance.UNSAFE_componentWillReceiveProps === 'function') {
        foundWillReceivePropsName = 'UNSAFE_componentWillReceiveProps';
      }

      if (typeof instance.componentWillUpdate === 'function' && instance.componentWillUpdate.__suppressDeprecationWarning !== true) {
        foundWillUpdateName = 'componentWillUpdate';
      } else if (typeof instance.UNSAFE_componentWillUpdate === 'function') {
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
    // todo
    instance.state = workInProgress.memoizedState;
  }

}

export {constructClassInstance , adoptClassInstance, mountClassInstance,  classComponentUpdater};