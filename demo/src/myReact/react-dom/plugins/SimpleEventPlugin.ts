import { topLevelEventsToReactNames ,registerSimpleEvents} from "../events/DOMEventProperties";
import { accumulateSinglePhaseListeners } from "../events/DOMPluginEventSystem";
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

  const listeners = accumulateSinglePhaseListeners(targetInst,reactName,nativeEvent.type,false,false)
  if(listeners.length > 0){
    const event = new SyntheticEventCtor(reactName,reactEventType,null,nativeEvent,nativeEventTarget)
    
    dispatchQueue.push({event, listeners});
  }
} 


export {registerSimpleEvents as registerEvents}