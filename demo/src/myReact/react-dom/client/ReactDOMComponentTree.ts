const randomKey = Math.random()
  .toString(36)
  .slice(2);
const internalInstanceKey = '__reactFiber$' + randomKey;
const internalPropsKey = '__reactProps$' + randomKey;


export function getClosestInstanceFromNode(targetNode){
  let targetInst =  targetNode[internalInstanceKey]
  if(targetInst){
    return targetInst
  }
}

export function precacheFiberNode(hostInst,node){
  node[internalInstanceKey] = hostInst
}

export function updateFiberProps(node,props){
  node[internalPropsKey] = props
}

export function getFiberCurrentPropsFromNode(node){
  return node[internalPropsKey] || null
}