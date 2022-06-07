import ReactCurrentDispatcher from "./ReactCurrentDispatcher";

function resolveDispatcher(){
  const dispatcher:any = ReactCurrentDispatcher.current;
  return dispatcher
}

export function useState(initialState){
  const dispatcher = resolveDispatcher()
  return dispatcher.useState(initialState);
}

export function useRef(initialState){
  const dispatcher = resolveDispatcher()
  return dispatcher.useRef(initialState)
}

export function useEffect(create,deps){
  const dispatcher = resolveDispatcher();
  return dispatcher.useEffect(create, deps);
}

export function useMemo(create,deps){
  const dispatcher = resolveDispatcher();
  return dispatcher.useMemo(create, deps);
}

export function useCallback(create,deps){
  const dispatcher = resolveDispatcher();
  return dispatcher.useCallback(create,deps)
}

export function useReducer(reducer,initialArg,init){
  const dispatcher = resolveDispatcher()
  return dispatcher.useReducer(reducer,initialArg,init)
}

export function useLayoutEffect(create, deps){
  const dispatcher = resolveDispatcher()
  return  dispatcher.useLayoutEffect(create, deps)
}