export function setValueForProperty(node,name,value,isCustomComponentTag){
  if(value == null){
    node.removeAttribute(name)
  }else{
    node.setAttribute(name,''+value)
  }
  return
}