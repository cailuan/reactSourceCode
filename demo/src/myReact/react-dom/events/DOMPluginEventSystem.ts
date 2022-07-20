import { addEventCaptureListener,addEventBubbleListener } from "./EventListener";
import { allNativeEvents } from "./EventRegistry";
import getEventTarget from "./getEventTarget";
import { createEventListenerWrapperWithPriority } from "./ReactDOMEventListener";
import { batchedEventUpdates } from "./ReactDOMUpdateBatching";
import * as SimpleEventPlugin from "../plugins/SimpleEventPlugin"
import { HostComponent } from "../../react-reconciler/ReactWorkTags";
import getListener from "./getListener";
import { invokeGuardedCallbackAndCatchFirstError } from "../../shared/ReactErrorUtils";

export const IS_CAPTURE_PHASE = 1 << 2;

SimpleEventPlugin.registerEvents()
const listeningMarker = '_reactListening' + Math.random().toString(36).slice(2)

export function listenToAllSupportedEvents(rootContainerElement){
  if(!rootContainerElement[listeningMarker]) {
    rootContainerElement[listeningMarker] = true
    allNativeEvents.forEach(event => {
      // 事件系统添加冒泡和捕获 dispatchDiscreteEvent
      listenToNativeEvent(event,false,rootContainerElement)
      listenToNativeEvent(event,true,rootContainerElement)
    });
  }
 
}

function executeDispatch(event,listener,currentTarget){
  const type = event.type || 'unknown-event';
  event.currentTarget = currentTarget;
  invokeGuardedCallbackAndCatchFirstError(type,listener,undefined,event)

  event.currentTarget = null;
}

function listenToNativeEvent(domEventName,isCapturePhaseListener,target){
  let eventSystemFlags = 0;
  if(isCapturePhaseListener){
    eventSystemFlags |= IS_CAPTURE_PHASE
  }
  addTrappedEventListener(target,domEventName,eventSystemFlags,isCapturePhaseListener)
}

function addTrappedEventListener(targetContainer,domEventName,eventSystemFlags,isCapturePhaseListener){
  // 添加事件 dispatchDiscreteEvent linster 事件
  const listener = createEventListenerWrapperWithPriority(targetContainer,domEventName,eventSystemFlags)
  let unsubscribeListener
  if(isCapturePhaseListener){
    unsubscribeListener = addEventCaptureListener(targetContainer,domEventName,listener)
  }else {
    unsubscribeListener = addEventBubbleListener(targetContainer,domEventName,listener)
  }
}

function processDispatchQueueItemsInOrder(event,dispatchListeners,inCapturePhase){
  let previousInstance;
  if (inCapturePhase) {
    for (let i = dispatchListeners.length - 1; i >= 0; i--) {
      const {instance, currentTarget, listener} = dispatchListeners[i];
      if (instance != previousInstance && event.isPropagationStopped()) {
        return;
      }
      executeDispatch(event, listener, currentTarget);
      previousInstance = instance;
    }
  }else{
    for (let i = 0; i < dispatchListeners.length; i++) {
      const {instance, currentTarget, listener} = dispatchListeners[i];
      if(instance != previousInstance && event.isPropagationStopped()){
        return
      }
      executeDispatch(event,listener,currentTarget)
      previousInstance = instance;
    }
  }
}

function extractEvents(dispatchQueue,domEventName,targetInst,nativeEvent,nativeEventTarget,eventSystemFlags,targetContainer){
  SimpleEventPlugin.extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer,
  )

}

function processDispatchQueue(dispatchQueue,eventSystemFlags){
  const inCapturePhase =  (eventSystemFlags & IS_CAPTURE_PHASE) != 0
  for (let i = 0; i < dispatchQueue.length; i++) {
    const {event, listeners} = dispatchQueue[i];
    processDispatchQueueItemsInOrder(event, listeners, inCapturePhase);
  }
}

function dispatchEventsForPlugins(domEventName,eventSystemFlags,nativeEvent,targetInst,targetContainer){
  const nativeEventTarget = getEventTarget(nativeEvent)
  const dispatchQueue = []
  extractEvents(dispatchQueue,domEventName,targetInst,nativeEvent,nativeEventTarget,eventSystemFlags,targetContainer)
  processDispatchQueue(dispatchQueue, eventSystemFlags)
}

export function dispatchEventForPluginEventSystem(domEventName,eventSystemFlags,nativeEvent,targetInst,targetContainer){
  let ancestorInst = targetInst;
  batchedEventUpdates(()=>{
    dispatchEventsForPlugins(domEventName,eventSystemFlags,nativeEvent,ancestorInst,targetContainer)
  })

}

function createDispatchListener(instance,listener,currentTarget){
  return {
    instance,
    listener,
    currentTarget,
  };
}


export function accumulateSinglePhaseListeners(targetFiber,reactName,nativeEventType,inCapturePhase,accumulateTargetOnly,nativeEvent?:any){

  const captureName = reactName != null ? reactName + 'Capture' : null;
  const reactEventName = inCapturePhase ? captureName : reactName;
  let listeners:any = []
  let instance = targetFiber;
  let lastHostComponent = null;
  while(instance != null){
    const {stateNode, tag} = instance;
    if(tag == HostComponent && stateNode != null){
      lastHostComponent = stateNode
      if(reactEventName != null){
        const listener =  getListener(instance,reactEventName)
        if(listener != null){
          listeners.push(createDispatchListener(instance,listener,lastHostComponent))
        }
      }
    }
    if(accumulateTargetOnly){
      break
    }
    instance = instance.return;
  }
  return listeners
}