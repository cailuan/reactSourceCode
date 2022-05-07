import isArray from "../shared/isArray"
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE } from "../shared/ReactSymbols"
import { createFiberFromText,createFiberFromElement } from "./ReactFiber"
import { Placement } from "./ReactFiberFlags"

export const reconcileChildFibers = ChildReconciler(true)
export const mountChildFibers = ChildReconciler(false)

function ChildReconciler(shouldTrackSideEffects){

  function placeSingleChild(newFiber){
    if(shouldTrackSideEffects && newFiber.alternate == null){
      newFiber.flags |= Placement
    }
    return newFiber
  }
  function reconcileSingleTextNode(returnFiber,currentFirstChild,textContent,lanes){
    const created = createFiberFromText(textContent,returnFiber.mode,lanes)
    created.return = returnFiber
    return created
  }
  function reconcileSingleElement(returnFiber,currentFirstChild,element,lanes){
    let child = currentFirstChild
    if(element.$$typeof === REACT_ELEMENT_TYPE){
      
      const created =  createFiberFromElement(element,returnFiber.mode,lanes)
      console.log(created,'createFiberFromElement')
      created.return = returnFiber
      return created
    }
  }
  function deleteRemainingChildren(returnFiber,currentFirstChild){
    if(!shouldTrackSideEffects){
      return null
    }
  }

  function reconcileChildrenArray(returnFiber,currentFirstChild,newChildren,lanes){

  }

  function reconcileChildFibers(returnFiber,currentFirstChild,newChild,lanes){
    let isUnkeyedTopLevelFragment = typeof newChild === 'object' && newChild != null && newChild.type === REACT_FRAGMENT_TYPE && newChild.key === null

    if(typeof newChild === 'object' && newChild != null){
      switch(newChild.$$typeof){
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(reconcileSingleElement(returnFiber,currentFirstChild,newChild,lanes))
      }
    }

    if(isArray(newChild)){
      return reconcileChildrenArray(returnFiber,currentFirstChild,newChild,lanes)
    }

    if(typeof newChild === 'number' || typeof newChild === 'string'){
      return placeSingleChild(reconcileSingleTextNode(returnFiber,currentFirstChild,''+newChild,lanes))
    }
    return deleteRemainingChildren(returnFiber,currentFirstChild)
  }
  return reconcileChildFibers
}