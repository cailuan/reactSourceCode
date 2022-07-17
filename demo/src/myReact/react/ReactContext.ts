import { REACT_CONTEXT_TYPE ,REACT_PROVIDER_TYPE} from "../shared/ReactSymbols";

export function createContext(defaultValue){
  const context:any = {
    $$typeof : REACT_CONTEXT_TYPE,
    _currentValue : defaultValue,
    _currentValue2: defaultValue,
    _threadCount: 0,
    Provider: (null as any),
    Consumer : (null as any)
  }
  context.Provider = {
    $$typeof : REACT_PROVIDER_TYPE,
    _context : context
  }
  let hasWarnedAboutUsingNestedContextConsumers = false;
  let hasWarnedAboutUsingConsumerProvider = false;
  let hasWarnedAboutDisplayNameOnConsumer = false;

  const Consumer = {
    $$typeof: REACT_CONTEXT_TYPE,
    _context: context,
  }

  Object.defineProperties(Consumer,{
    Provider:{
      get(){
        if(!hasWarnedAboutUsingConsumerProvider){
          hasWarnedAboutUsingConsumerProvider = true
          console.error(' <Context.Consumer.Provider> ')
        }
        return context.Provider
      },
      set(_Provider){
        console.log('defineProperties set')
        context.Provider = _Provider;
      }
    },
    _currentValue:{
      get() {
        return context._currentValue;
      },
      set(_currentValue) {
        context._currentValue = _currentValue;
      },
    },
    _currentValue2: {
      get() {
        return context._currentValue2;
      },
      set(_currentValue2) {
        context._currentValue2 = _currentValue2;
      },
    },
    _threadCount: {
      get() {
        return context._threadCount;
      },
      set(_threadCount) {
        context._threadCount = _threadCount;
      },
    },
    Consumer:{
      get(){
        if(!hasWarnedAboutUsingNestedContextConsumers){
          hasWarnedAboutUsingNestedContextConsumers = true
          console.error('Rendering <Context.Consumer.Consumer> is not supported and will be removed in ')
        }
        return context.Consumer
      },

    },
    displayName:{
      get() {
        return context.displayName;
      },
      set(displayName){
        if (!hasWarnedAboutDisplayNameOnConsumer) {
          console.warn(
            'Setting `displayName` on Context.Consumer has no effect. ' +
              "You should set it directly on the context with Context.displayName = '%s'.",
            displayName,
          );
          hasWarnedAboutDisplayNameOnConsumer = true;
        }
      }
    }
  })

  context.Consumer = Consumer;

  context._currentRenderer = null;
  context._currentRenderer2 = null;
  return context
}