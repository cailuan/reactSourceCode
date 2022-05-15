function functionThatReturnsTrue() {
  return true;
}

function functionThatReturnsFalse() {
  return false;
}

function createSyntheticEvent(Interface){
  function SyntheticBaseEvent(reactName,reactEventType,targetInst,nativeEvent,nativeEventTarget):void{
    this._reactName = reactName;
    this._targetInst = targetInst;
    this.type = reactEventType;
    this.nativeEvent = nativeEvent;
    this.target = nativeEventTarget;
    this.currentTarget = null;
    for (const propName in Interface) {
      if (!Interface.hasOwnProperty(propName)) {
        continue;
      }
      const normalize = Interface[propName];
      if (normalize) {
        this[propName] = normalize(nativeEvent);
      } else {
        this[propName] = nativeEvent[propName];
      }
    }
    const defaultPrevented = nativeEvent.defaultPrevented != null  ? nativeEvent.defaultPrevented : nativeEvent.returnValue === false;
    if(defaultPrevented){
      this.isDefaultPrevented = functionThatReturnsTrue
    } else {
      this.isDefaultPrevented = functionThatReturnsFalse;
    }
    this.isPropagationStopped = functionThatReturnsFalse;
    return this;
  }

  Object.assign(SyntheticBaseEvent.prototype,{
    preventDefault:()=>{
      console.log('preventDefault')
    },
    stopPropagation:()=>{
      console.log('stopPropagation')
    },
    persist:()=>{
      console.log('persist')
    },
    isPersistent: functionThatReturnsTrue,
  })

  return SyntheticBaseEvent;
}

const EventInterface = {
  eventPhase: 0,
  bubbles: 0,
  cancelable: 0,
  timeStamp: function(event) {
    return event.timeStamp || Date.now();
  },
  defaultPrevented: 0,
  isTrusted: 0,
}

const UIEventInterface = {
  ...EventInterface,
  view: 0,
  detail: 0,
}

const MouseEventInterface = {
  ...UIEventInterface,
  screenX: 0,
  screenY: 0,
  clientX: 0,
  clientY: 0,
  pageX: 0,
  pageY: 0,
  ctrlKey: 0,
  shiftKey: 0,
  altKey: 0,
  metaKey: 0,
  movementX:()=>{
    console.log('movementX')
  },
  movementY:()=>{
    console.log('movementY')
  }
}


export const SyntheticMouseEvent = createSyntheticEvent(MouseEventInterface);

export const SyntheticEvent = createSyntheticEvent(EventInterface)