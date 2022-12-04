import {
  createContainer,
  findHostInstanceWithNoPortals,
  updateContainer,
} from "../../react-reconciler/ReactFiberReconciler";
import { ConcurrentRoot } from "../../react-reconciler/ReactRootTags";
import { listenToAllSupportedEvents } from "../events/DOMPluginEventSystem";
import { createPortal as createPortalImpl } from "../../react-reconciler/ReactPortal";
import { COMMENT_NODE } from "../../shared/HTMLNodeType";

export function createRoot(container, option) {
  const root = createContainer(container, ConcurrentRoot);

  listenToAllSupportedEvents(container);
  return new ReactDOMRoot(root);
}

//添加 _internalRoot 属性
function ReactDOMRoot(internalRoot) {
  this._internalRoot = internalRoot;
}

ReactDOMRoot.prototype.render = function (children: any) {
  let root = this._internalRoot;
  var container = root.containerInfo;
  if (container.nodeType != COMMENT_NODE) {
    // 忽略 无用
    const hostInstance = findHostInstanceWithNoPortals(root.current);
  }
  updateContainer(children, root);
};

export function createPortal(children, container, key) {
  return createPortalImpl(children, container, null, key);
}
