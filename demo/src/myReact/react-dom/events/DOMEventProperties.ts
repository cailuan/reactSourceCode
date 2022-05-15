export const  topLevelEventsToReactNames = new Map()

const simpleEventPluginEvents = ['click']


function registerSimpleEvent(domEventName, reactName){
  topLevelEventsToReactNames.set(domEventName, reactName);
}

export function registerSimpleEvents(){
  for (let i = 0; i < simpleEventPluginEvents.length; i++) {
    const eventName = simpleEventPluginEvents[i]
    const domEventName = eventName.toLowerCase()
    const capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1);
    registerSimpleEvent(domEventName,'on' + capitalizedEvent)
  }
}