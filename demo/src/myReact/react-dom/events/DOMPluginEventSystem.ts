import { allNativeEvents } from "./EventRegistry";

export function listenToAllSupportedEvents(rootContainerElement){
  allNativeEvents.forEach(event => {
    listenToNativeEvent(event,rootContainerElement)
  });
}

function listenToNativeEvent(domEventName,target){
  addTrappedEventListener(target,domEventName)
}

function addTrappedEventListener(target,domEventName){
  //todo 添加事件
  // createEventListenerWrapperWithPriority(target,domEventName)
}