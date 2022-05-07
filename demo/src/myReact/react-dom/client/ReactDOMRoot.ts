
import { createContainer, findHostInstanceWithNoPortals, updateContainer } from "../../react-reconciler/ReactFiberReconciler";
import { ConcurrentRoot } from "../../react-reconciler/ReactRootTags";
import { listenToAllSupportedEvents } from "../events/DOMPluginEventSystem";
import {COMMENT_NODE} from '../../shared/HTMLNodeType'

export function createRoot(container,option){


  const root = createContainer(container,ConcurrentRoot)

  listenToAllSupportedEvents(container)
  return new ReactDOMRoot(root)
  
}

function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot;
}

ReactDOMRoot.prototype.render = function(children: any){
  let root = this._internalRoot 
  var container = root.containerInfo;
  if(container.nodeType !=  COMMENT_NODE){
    const hostInstance = findHostInstanceWithNoPortals(root.current)
  }
  updateContainer(children,root)

}