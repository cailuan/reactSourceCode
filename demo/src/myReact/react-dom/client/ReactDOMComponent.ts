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
      }
    }
  }
}

function setTextContent(node,text){
  node.textContent = text;
}