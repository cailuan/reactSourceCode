import { createTextNode,createElement,setInitialProperties } from "./ReactDOMComponent"

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
  return domElement
}

export function finalizeInitialChildren(domElement,type,props,rootContainerInstance){
  setInitialProperties(domElement, type, props, rootContainerInstance)
}

export function appendInitialChild(parentInstance,child){
  parentInstance.appendChild(child);
}