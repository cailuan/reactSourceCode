import { getClosestInstanceFromNode } from "../client/ReactDOMComponentTree";
import { dispatchEventForPluginEventSystem } from "./DOMPluginEventSystem";
import getEventTarget from "./getEventTarget";
import { discreteUpdates } from "./ReactDOMUpdateBatching";

export function createEventListenerWrapperWithPriority(targetContainer,domEventName,eventSystemFlags){
  const listenerWrapper = dispatchDiscreteEvent
  window["linster" + domEventName] = listenerWrapper.bind(
    null,
    domEventName,
    eventSystemFlags,
    targetContainer,
  );
  return window["linster" + domEventName]
}

export function dispatchEvent(domEventName,eventSystemFlags,targetContainer,nativeEvent){
  const blockedOn = attemptToDispatchEvent(domEventName,eventSystemFlags,targetContainer,nativeEvent)
}

export function attemptToDispatchEvent(domEventName,eventSystemFlags,targetContainer,nativeEvent){
  const nativeEventTarget = getEventTarget(nativeEvent)
  let targetInst = getClosestInstanceFromNode(nativeEventTarget)
  dispatchEventForPluginEventSystem(domEventName,eventSystemFlags,nativeEvent,targetInst,targetContainer)
  
}

function dispatchDiscreteEvent(domEventName,eventSystemFlags,container,nativeEvent){
  discreteUpdates(dispatchEvent,domEventName,eventSystemFlags,container,nativeEvent)
}
