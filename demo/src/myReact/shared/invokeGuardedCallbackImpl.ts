let invokeGuardedCallbackImpl:any = null;

if (
  typeof window !== 'undefined' &&
  typeof window.dispatchEvent === 'function' &&
  typeof document !== 'undefined' &&
  typeof document.createEvent === 'function'
) {
  const fakeNode = document.createElement('react');
  invokeGuardedCallbackImpl = function invokeGuardedCallbackDev (name,func,context,a){
    const evt = document.createEvent('Event');
    const windowEvent = window.event;
    let didCall = false;
    let didError = true;
    const funcArgs = Array.prototype.slice.call(arguments, 3);
    const evtType = `react-${name ? name : 'invokeguardedcallback'}`;
    function restoreAfterDispatch(){
      fakeNode.removeEventListener(evtType, callCallback, false);
      if (
        typeof window.event !== 'undefined' &&
        window.hasOwnProperty('event')
      ) {
        window.event = windowEvent;
      }
    }
    const windowEventDescriptor = Object.getOwnPropertyDescriptor(
      window,
      'event',
    );
    function callCallback(){
      // console.log('callCallback')
      didCall = true
      restoreAfterDispatch()
      func.apply(context,funcArgs)
      didError = false;
    }
    fakeNode.addEventListener(evtType, callCallback, false);
    evt.initEvent(evtType,false,false)
    fakeNode.dispatchEvent(evt);
    if (windowEventDescriptor) {
      Object.defineProperty(window, 'event', windowEventDescriptor);
    }
  }
}

export default invokeGuardedCallbackImpl;