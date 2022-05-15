import invokeGuardedCallbackImpl from "./invokeGuardedCallbackImpl"

export function invokeGuardedCallbackAndCatchFirstError(name,func,context,a){
  invokeGuardedCallback.apply(this,[name,func,context,a])
}

export function invokeGuardedCallback(name,func,context,a){
  invokeGuardedCallbackImpl.apply(this,[name,func,context,a])
}