import { topLevelEventsToReactNames ,registerSimpleEvents} from "../events/DOMEventProperties";
import { accumulateSinglePhaseListeners, IS_CAPTURE_PHASE } from "../events/DOMPluginEventSystem";
import { SyntheticMouseEvent,SyntheticEvent } from "../events/SyntheticEvent";

export function extractEvents(dispatchQueue,domEventName,targetInst,nativeEvent,nativeEventTarget,eventSystemFlags,targetContainer){
  const reactName = topLevelEventsToReactNames.get(domEventName)
  const reactEventType = domEventName
  if (reactName === undefined) {
    return;
  }
  let SyntheticEventCtor = SyntheticEvent;

  switch(domEventName){
    case 'click':
      SyntheticEventCtor = SyntheticMouseEvent;
      break;
  }
  const inCapturePhase =  (eventSystemFlags &  IS_CAPTURE_PHASE) !== 0
  const accumulateTargetOnly = false
  const listeners = accumulateSinglePhaseListeners(targetInst,reactName,nativeEvent.type,inCapturePhase,accumulateTargetOnly,nativeEvent)
  if(listeners.length > 0){
    const event = new SyntheticEventCtor(reactName,reactEventType,null,nativeEvent,nativeEventTarget)
    
    dispatchQueue.push({event, listeners});
  }
} 


export {registerSimpleEvents as registerEvents}