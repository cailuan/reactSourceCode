import { REACT_LAZY_TYPE } from "../shared/ReactSymbols";

const Uninitialized = -1;
const Pending = 0;
const Resolved = 1;
const Rejected = 2;

function lazyInitializer(payload) {
  debugger
  if (payload._status == Uninitialized) {
    const ctor = payload._result;
    const thenable = ctor();
    thenable.then(
      function (moduleObject) {
        if (payload._status === Pending || payload._status === Uninitialized) {
          const resolved = payload;
          resolved._status = Resolved;
          resolved._result = moduleObject;
        }
      },
      function (error) {
        if (payload._status === Pending || payload._status === Uninitialized) {
          const rejected = payload;
          rejected._status = Rejected;
          rejected._result = error;
        }
      }
    ).catch(e=>{
      console.log(e,"===-=-=-=-=-=")
    });

    if (payload._status == Uninitialized) {
      const pending = payload;
      pending._status = Pending;
      pending._result = thenable;
    }

    if (payload._status == Resolved) {
      const moduleObject = payload._result;
      return moduleObject.default;
    }
  }

  if (payload._status == Resolved) {
    let moduleObject = payload._result;
    return moduleObject.default;
  } else {
    throw payload._result;
  }
}

export function lazy(ctor) {
  const payload = {
    _status: Uninitialized,
    _result: ctor,
  };

  const lazyType = {
    $$typeof: REACT_LAZY_TYPE,
    _payload: payload,
    _init: lazyInitializer,
  };

  return lazyType;
}
