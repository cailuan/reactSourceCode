import { registrationNameDependencies } from "../events/EventRegistry";

const CHILDREN = 'children';
const STYLE = 'style';

export function createTextNode(text,rootContainerInstance){
  return document.createTextNode(text)
}

export function createElement(type,props,rootContainerElement,parentNamespace){
  return document.createElement(type)
}

export function setInitialProperties(domElement,tag,rawProps,rootContainerElement){
  let props
  switch (tag) {
    default:
      props = rawProps;
  }
  setInitialDOMProperties( 
    tag,
    domElement,
    rootContainerElement,
    props,
    true,
    )
}

function setInitialDOMProperties(tag,domElement,rootContainerElement,nextProps,isCustomComponentTag){
  for (const propKey in nextProps) {
    const nextProp = nextProps[propKey];
    if(propKey === CHILDREN){
      if(typeof nextProp === 'string'){
        setTextContent(domElement, nextProp)
      }else if(typeof nextProp === 'number'){
        setTextContent(domElement, '' + nextProp)
      }
    }else if(registrationNameDependencies.hasOwnProperty(propKey)){
      if(nextProp != null){
        if(typeof nextProp != 'function'){
          
        }
      }
    }
  }
}

function setTextContent(node,text){
  node.textContent = text;
}


export function diffProperties(domElement,tag,lastRawProps,nextRawProps,rootContainerElement){
  let updatePayload:any = null
  let lastProps = lastRawProps;
  let nextProps = nextRawProps;

  let propKey;
  let styleName;
  let styleUpdates = null;

  for (propKey in lastProps) {
    if(nextProps.hasOwnProperty(propKey)){
      continue
    }
  }
  for (propKey in nextProps) {
    const nextProp = nextProps[propKey];
    const lastProp = lastProps != null ? lastProps[propKey] : undefined;
    if(nextProp == lastProp || (nextProp == null && lastProp == null)){
      continue
    }
    if(propKey === CHILDREN){
      if(typeof nextProp == 'string' || typeof nextProp == 'number' ){
        (updatePayload = updatePayload || []).push(propKey, '' + nextProp)
      }
    } else
    if(registrationNameDependencies.hasOwnProperty(propKey)){
      if(lastProp != nextProp){
        updatePayload = []
      }
    }
  }
  return updatePayload
}
function updateDOMProperties(domElement,updatePayload,wasCustomComponentTag,isCustomComponentTag){
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i];
    const propValue = updatePayload[i + 1];
    if(propKey == CHILDREN){
      setTextContent(domElement,propValue)
    }
  }
}

export function updateProperties(domElement,updatePayload,tag,lastRawProps,nextRawProps){
  updateDOMProperties(domElement,updatePayload,false,false)
}