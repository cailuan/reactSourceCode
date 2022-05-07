import { createHostRootFiber } from "./ReactFiber";
import { initializeUpdateQueue } from "./ReactUpdateQueue";

export function createFiberRoot(container,tag){
  const root = new FiberRootNode(container,tag)
  const uninitializedFiber = createHostRootFiber()
  root.current = uninitializedFiber
  uninitializedFiber.stateNode = root
  var initialState = {
    element: null
  };
  uninitializedFiber.memoizedState = initialState;
  initializeUpdateQueue(uninitializedFiber)
  return root

}

// fiberRoot 创建的节点
function FiberRootNode(container,tag){
  this.tag = tag
  this.containerInfo = container
  this.current = null;
}