import isArray from "../shared/isArray"
import { REACT_ELEMENT_TYPE, REACT_FRAGMENT_TYPE, REACT_OFFSCREEN_TYPE, REACT_PORTAL_TYPE } from "../shared/ReactSymbols"
import { createFiberFromText,createFiberFromElement, createWorkInProgress, createFiberFromPortal } from "./ReactFiber"
import { ChildDeletion, NoFlags, Placement } from "./ReactFiberFlags"
import { NoLanes } from "./ReactFiberLane";
import { HostPortal, HostText, OffscreenComponent } from "./ReactWorkTags";


function coerceRef(returnFiber,current,element){
  const mixedRef = element.ref;
  if(mixedRef != null && typeof mixedRef != 'function' && typeof mixedRef != 'object'){
    
  }
  return mixedRef
}

export const reconcileChildFibers = ChildReconciler(true)
export const mountChildFibers = ChildReconciler(false)


function ChildReconciler(shouldTrackSideEffects){

  function uFiber(fiber,pendingProps){
    const clone = createWorkInProgress(fiber,pendingProps)
    clone.index = 0;
    clone.sibling = null;
    return clone
  }
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
    let key = element.key
    while(child != null){
      if(child.key == key){
        const elementType = element.type;
        if(elementType == REACT_FRAGMENT_TYPE){

        }else{
          if(child.elementType == elementType){
  
            const existing = uFiber(child, element.props)
            existing.ref =  coerceRef(returnFiber,child,element)
            existing.return = returnFiber;
            return existing;
          }
        }
      }
    }

    if(element.$$typeof == REACT_ELEMENT_TYPE){
      
      const created =  createFiberFromElement(element,returnFiber.mode,lanes)
      created.ref = coerceRef(returnFiber,currentFirstChild,element)
      console.log(created,'createFiberFromElement')
      created.return = returnFiber
      return created
    }
  }

  function reconcileSinglePortal(returnFiber,currentFirstChild,portal,lanes){
    const key = portal.key;
    let child = currentFirstChild;
    while(child != null){
      if(child.key == key){
        if(child.tag == HostPortal && child.stateNode.containerInfo == portal.containerInfo &&
          child.stateNode.implementation == portal.implementation ){
            
            deleteRemainingChildren(returnFiber, child.sibling);
            const existing = uFiber(child, portal.children || []);
            existing.return = returnFiber;
            return existing;
        } else {
          deleteRemainingChildren(returnFiber, child);
          break;
        }
      }else {
        deleteChild(returnFiber, child);
      }
      
      child = child.sibling;
    }

    const created = createFiberFromPortal(portal, returnFiber.mode, lanes);
    created.return = returnFiber;
    return created;
  }

  function deleteRemainingChildren(returnFiber,currentFirstChild){
    if(!shouldTrackSideEffects){
      return null
    }
    let childToDelete = currentFirstChild;
    while(childToDelete != null){

    }
    return null

  }
  function createChild(returnFiber,newChild,lanes){
    if(typeof newChild == 'string' || typeof newChild == 'number'){
      const created = createFiberFromText(''+newChild,returnFiber.mode,lanes)
      created.return = returnFiber
      return created
    }
    if(typeof newChild == 'object' && typeof newChild != null){
      switch(newChild.$$typeof){
        case REACT_ELEMENT_TYPE:
          const created = createFiberFromElement(newChild,returnFiber.mode,lanes)
          created.ref = coerceRef(returnFiber,null,newChild)
          created.return = returnFiber
          return created
      }
    }

  }

  function placeChild(newFiber,lastPlacedIndex,newIdx){
    newFiber.index = newIdx
    if(!shouldTrackSideEffects) return lastPlacedIndex
    const current = newFiber.alternate;
    if(current != null){
      const oldIndex = current.index;
      if(oldIndex < lastPlacedIndex){
debugger
      }else{
        return oldIndex
      }
    }else{
      newFiber.flags |= Placement
    return lastPlacedIndex
    }
    
    
  }

  function reconcileChildrenArray(returnFiber,currentFirstChild,newChildren,lanes){
    let oldFiber = currentFirstChild
    let newIdx = 0
    let resultingFirstChild = null
    let previousNewFiber:any = null
    let lastPlacedIndex = 0
    let nextOldFiber = null;

    for(; oldFiber != null && newIdx  < newChildren.length ;newIdx++){
      if(oldFiber.index > newIdx){
        nextOldFiber = oldFiber
        oldFiber = null
      }else{
        nextOldFiber = oldFiber.sibling
      }
      const newFiber = updateSlot(returnFiber,oldFiber,newChildren[newIdx],lanes)
      if (newFiber == null) {
        if(oldFiber == null){
          oldFiber = nextOldFiber
        }
        break
      }
      if(shouldTrackSideEffects){
        if(oldFiber && newFiber.alternate == null){
          debugger
        }
      }
      lastPlacedIndex = placeChild(newFiber,lastPlacedIndex,newIdx)

      if(previousNewFiber == null){
        resultingFirstChild = newFiber
      }else{
        previousNewFiber.sibling = newFiber
      }

      previousNewFiber = newFiber
      oldFiber = nextOldFiber

    }

    if(newIdx == newChildren.length){
      deleteRemainingChildren(returnFiber,oldFiber)
      return resultingFirstChild
    }

    if(oldFiber == null){
      for(; newIdx < newChildren.length ; newIdx++){
        const newFiber = createChild(returnFiber,newChildren[newIdx],lanes)

        if(newFiber == null) continue;
        lastPlacedIndex = placeChild(newFiber,lastPlacedIndex,newIdx)
        
        if(previousNewFiber == null){
          resultingFirstChild = newFiber
        }else{
          previousNewFiber.sibling = newFiber
        }
        previousNewFiber = newFiber

      }
      return resultingFirstChild
    }

    const existingChildren = mapRemainingChildren(returnFiber , oldFiber)
    debugger
    for(; newIdx < newChildren.length ; newIdx++){
      const newFiber = updateFromMap(existingChildren , returnFiber, newIdx, newChildren[newIdx], lanes)
      if(newFiber != null){
        if(shouldTrackSideEffects){
          if (newFiber.alternate != null) {
            existingChildren.delete(newFiber.key == null ? newIdx : newFiber.key)
          }
        }

        lastPlacedIndex =  placeChild(newFiber, lastPlacedIndex , newIdx)
        if(previousNewFiber == null){
          resultingFirstChild = newFiber
        }else{
          previousNewFiber.sibling = newFiber
        }
        previousNewFiber = newFiber
      }
    }
    if(shouldTrackSideEffects) {
      existingChildren.forEach(function(child){
        return deleteChild(returnFiber,child)
      })
    }

    return resultingFirstChild
  }

  function deleteChild(returnFiber, childToDelete){
    if(!shouldTrackSideEffects){
      return
    }
    const deletions = returnFiber.deletions;
    if(deletions == null){
      returnFiber.deletions = [childToDelete]
      returnFiber.flags |= ChildDeletion
    }else{
      deletions.push(childToDelete)
    }
  }

  function updateFromMap(existingChildren , returnFiber, newIdx, newChild,lanes){
    if(typeof newChild == 'number' || typeof newChild == 'string'){
      debugger
    }
    if(typeof newChild == 'object' && newChild != null){
      switch(newChild.$$typeof){
        case REACT_ELEMENT_TYPE:
          const matchedFiber = existingChildren.get(newChild.key == null ? newIdx : newChild.key ) || null
          return updateElement(returnFiber, matchedFiber, newChild, lanes)
      }
    }
    return null
  }


  function mapRemainingChildren(returnFiber,currentFirstChild){
    const existingChildren = new Map();
    let existingChild = currentFirstChild;

    while(existingChild != null){
      if(existingChild.key  != null){
        existingChildren.set(existingChild.key , existingChild)
      }else {
        existingChildren.set(existingChild.index , existingChild)
      }
      existingChild = existingChild.sibling
    }
    return existingChildren
  }

  function updateTextNode(returnFiber,current,textContent,lanes){
    if(current == null  || current.tag != HostText){
      let created = createFiberFromText(textContent,returnFiber.mode,lanes)
      created.return = returnFiber;
      return created;
    }else{
      const existing = uFiber(current,textContent)
      existing.return = returnFiber;
      return existing
    }
  }

  function updateElement(returnFiber,current,element,lanes){
    const elementType = element.type;
    if(current != null){
      if(current.elementType == elementType){
        const existing = uFiber(current,element.props)
        existing.ref = coerceRef(returnFiber,current,element)
        existing.return = returnFiber;
        return existing
      }
    }

    const created = createFiberFromElement(element,returnFiber.mode, lanes)
    created.ref = coerceRef(returnFiber,current,element)
    created.return = returnFiber
    return created
  }

  function updateSlot(returnFiber,oldFiber,newChild,lanes){
    const key = oldFiber != null ? oldFiber.key : null;
    if(typeof newChild == 'string' || typeof newChild == 'number'){
      if(key != null){
        return null
      }
      return updateTextNode(returnFiber,oldFiber,''+newChild,lanes)
    }
    if(typeof newChild == 'object' && newChild != null){
      switch(newChild.$$typeof){
        case REACT_ELEMENT_TYPE:
          if(newChild.key == key){
            return updateElement(returnFiber,oldFiber,newChild,lanes)
          }else{
            return null
          }
      }
    }
    return null
  }

  function reconcileChildFibers(returnFiber,currentFirstChild,newChild,lanes){
    let isUnkeyedTopLevelFragment = typeof newChild == 'object' && newChild != null && newChild.type == REACT_FRAGMENT_TYPE && newChild.key == null
    if(isUnkeyedTopLevelFragment){
      newChild = newChild.props.children;
    }

    if(typeof newChild == 'object' && newChild != null){
      switch(newChild.$$typeof){
        case REACT_ELEMENT_TYPE:
          return placeSingleChild(reconcileSingleElement(returnFiber,currentFirstChild,newChild,lanes))
        case REACT_PORTAL_TYPE:
          return placeSingleChild(reconcileSinglePortal(returnFiber,currentFirstChild,newChild,lanes))
      }
    }

    if(isArray(newChild)){
      return reconcileChildrenArray(returnFiber,currentFirstChild,newChild,lanes)
    }

    if(typeof newChild == 'number' || typeof newChild == 'string'){
      return placeSingleChild(reconcileSingleTextNode(returnFiber,currentFirstChild,''+newChild,lanes))
    }
    return deleteRemainingChildren(returnFiber,currentFirstChild)
  }
  return reconcileChildFibers
}

export function cloneChildFibers(current,workInProgress){
  if (workInProgress.child == null) {
    return;
  }
  let currentChild = workInProgress.child;

  let newChild = createWorkInProgress(currentChild,currentChild.pendingProps)
  workInProgress.child = newChild;
  newChild.return = workInProgress;
  while (currentChild.sibling != null) {
  
  }
  newChild.sibling = null;
}






