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