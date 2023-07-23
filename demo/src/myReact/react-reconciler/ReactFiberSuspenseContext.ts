import {createCursor, pop, push} from './ReactFiberStack'

const suspenseHandlerStackCursor = createCursor(null)

export function getSuspenseHandler(){
    return suspenseHandlerStackCursor.current;
  }

export function pushPrimaryTreeSuspenseHandler(handler){
  const props = handler.pendingProps;
  push(suspenseHandlerStackCursor,handler,handler)
}


export function popSuspenseHandler(fiber): void {
  pop(suspenseHandlerStackCursor, fiber);
}

export function reuseSuspenseHandlerOnStack(fiber){
  push(suspenseHandlerStackCursor,getSuspenseHandler(),fiber)
}