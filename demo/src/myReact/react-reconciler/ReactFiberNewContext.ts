let currentlyRenderingFiber = null


export function readContext(context){

}


export function prepareToReadContext(workInProgress, renderLanes){
  currentlyRenderingFiber = workInProgress
  
}