import { findCurrentFiberUsingSlowPath } from "./ReactFiberTreeReflection"

export function findCurrentHostFiberWithNoPortals(parent){
  
  var currentParent = findCurrentFiberUsingSlowPath(parent)
  findCurrentHostFiberWithNoPortalsImpl(currentParent)
  return null
}

function findCurrentHostFiberWithNoPortalsImpl(node){
  return null
}