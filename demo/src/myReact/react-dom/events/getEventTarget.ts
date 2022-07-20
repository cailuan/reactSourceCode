import { TEXT_NODE } from "../../shared/HTMLNodeType";

function getEventTarget(nativeEvent){
  let target = nativeEvent.target || nativeEvent.srcElement || window;
  return target.nodeType == TEXT_NODE ? target.parentNode : target
}
export default getEventTarget