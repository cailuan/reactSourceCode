import { createCursor, push } from "./ReactFiberStack";

const rootInstanceStackCursor = createCursor({})


function requiredContext(c){
  return c
}

export function getRootHostContainer(){
  const rootInstance = requiredContext(rootInstanceStackCursor.current);
  return rootInstance;
}

export function pushHostContainer(fiber,nextRootInstance){
  push(rootInstanceStackCursor,nextRootInstance)
}