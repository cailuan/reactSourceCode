import { REACT_CONTEXT_TYPE, REACT_MEMO_TYPE } from "../shared/ReactSymbols";

export function memo(type,compare){
  const elementType ={
    $$typeof:  REACT_MEMO_TYPE,
    type,
    compare:  compare == undefined ? null : compare,
  }


  return elementType;
}