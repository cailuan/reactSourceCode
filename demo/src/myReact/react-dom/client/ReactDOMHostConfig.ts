import { createTextNode,createElement,setInitialProperties, diffProperties, updateProperties } from "./ReactDOMComponent"
import { precacheFiberNode, updateFiberProps } from "./ReactDOMComponentTree";

export function createTextInstance(text,rootContainerInstance,hostContext,internalInstanceHandle){
  const textNode = createTextNode(text,rootContainerInstance)
  return textNode
}

export function appendChildToContainer(container,child){
  let parentNode;
  parentNode = container;
  parentNode.appendChild(child);
}

export function createInstance(type,props,rootContainerInstance,hostContext,internalInstanceHandle){
  if(typeof props.children === 'string' || typeof props.children === 'number' ){
    const string = '' + props.children;

  }
  const domElement = createElement(type,props,rootContainerInstance,{})
  precacheFiberNode(internalInstanceHandle,domElement)
  updateFiberProps(domElement,props)
  return domElement
}

export function finalizeInitialChildren(domElement,type,props,rootContainerInstance){
  setInitialProperties(domElement, type, props, rootContainerInstance)
}

export function appendInitialChild(parentInstance,child){
  parentInstance.appendChild(child);
}


export function prepareUpdate(domElement,type,oldProps,newProps,rootContainerInstance,hostContext){

  return diffProperties(domElement,type,oldProps,newProps,rootContainerInstance)
  
}


export function commitUpdate(domElement,updatePayload,type,oldProps,newProps,internalInstanceHandle){
  updateFiberProps(domElement,newProps)
  updateProperties(domElement, updatePayload, type, oldProps, newProps)
  
}
 
export function commitTextUpdate(textInstance,oldText,newText){
  textInstance.nodeValue = newText;
}