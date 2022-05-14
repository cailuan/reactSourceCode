export { createRoot } from './client/ReactDOM'

 


// const root :fiber= {
//   tag : tag
//   containerInfo : Element
//   current :  Fiber
// }


// root.Fiber = {
//   tag : HostRoot
//   key :key
//   stateNode : RootFiber
//   memoizedState: {
//     element : null
//   }
//   updateQueue : {
//     baseState : {memoizedState: {
//       element : null
//     }}
//     firstBaseUpdate : null,
//     lastBaseUpdate: null,
//     shared:{
//       pending:null, // 添加逻辑
//       lanes: NoLanes
      
//     },
//     effects:null
//   },
//   lane : 0| 16 // fiber.lane = mergeLanes(fiber.lane , lane)
//   pendingLanes : 16
//   eventTimes:[]
// }



// updateQueue.shared.pending  = {
//   callback: null
//   eventTime: 33134.5
//   lane: 16
//   next: null //  updateQuene  enqueueUpdate 变成self
//   payload: {element: 111}
//   tag: 0
// }

