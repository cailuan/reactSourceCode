import { createHostRootFiber } from "./ReactFiber";
import { NoLane, NoLanes } from "./ReactFiberLane";
import { initializeUpdateQueue } from "./ReactUpdateQueue";

export function createFiberRoot(container,tag){
  // 创建 root node节点
  const root = new FiberRootNode(container,tag)
  // 创建 current 节点
  const uninitializedFiber = createHostRootFiber()
  root.current = uninitializedFiber
  uninitializedFiber.stateNode = root
  var initialState = {
    element: null
  };
  // current memoizedState 元素节点
  uninitializedFiber.memoizedState = initialState;
  // 初始化fiber updateQueue
  initializeUpdateQueue(uninitializedFiber)
  return root

}

// fiberRoot 创建的节点
function FiberRootNode(container,tag){
  this.tag = tag
  this.containerInfo = container
  this.current = null;
  this.callbackPriority = NoLane
}