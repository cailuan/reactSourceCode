import { HostRoot } from "../react-reconciler/ReactWorkTags";

export function findCurrentFiberUsingSlowPath(fiber){
  var alternate = fiber.alternate;
  var nearestMounted =  getNearestMountedFiber(fiber)

  return fiber
}

function getNearestMountedFiber(fiber){
  if(fiber.type === HostRoot){
    return fiber
  }
}