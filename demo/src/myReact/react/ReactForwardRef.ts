import { REACT_FORWARD_REF_TYPE } from "../shared/ReactSymbols";

export function forwardRef(render){
  const elementType = {
    $$typeof: REACT_FORWARD_REF_TYPE,
    render
  }
  let ownName;
  Object.defineProperty(elementType,'displayName',{
    enumerable: false,
    configurable: true,
    get: function() {
      return ownName;
    },
    set: function(name) {
      ownName = name;
      if (!render.name && !render.displayName) {
        render.displayName = name;
      }
    }
  })
  return elementType;
}