
import { NoLanes } from "./ReactFiberLane"
import { createCursor, pop, push } from "./ReactFiberStack"

let currentlyRenderingFiber:any = null
let lastContextDependency:any = null
const valueCursor = createCursor(null)

export function pushProvider(providerFiber, context, nextValue){
  push(valueCursor,context._currentValue, providerFiber)
  context._currentValue = nextValue;
}

export function popProvider(context, providerFiber){
  const currentValue =  valueCursor.current
  pop(valueCursor, providerFiber)
  context._currentValue = currentValue;
}


export function readContext(context){
  const value = context._currentValue
  const contextItem = {
    context: context,
    memoizedValue: value,
    next: null
  }
  if(lastContextDependency == null){
   
    if(!(currentlyRenderingFiber != null)){
      console.error('readContext')
    }
    lastContextDependency = contextItem
    currentlyRenderingFiber.dependencies = {
      lanes :NoLanes,
      firstContext: contextItem
    }

  }else{
    lastContextDependency = lastContextDependency.next = contextItem
  }
  return value
}


export function prepareToReadContext(workInProgress, renderLanes){
  currentlyRenderingFiber = workInProgress
  
}