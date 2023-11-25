import ReactNoopUpdateQueue from "./ReactNoopUpdateQueue";
const emptyObject = {};

function Component(props?:any, context?:any, updater?:any) {
  this.props = props;
  this.context = context;
  // If a component has string refs, we will assign a different object later.
  this.refs = emptyObject;
  // We initialize the default updater but the real one gets injected by the
  // renderer.
  this.updater = updater || ReactNoopUpdateQueue;
};

Component.prototype.isReactComponent = {};

Component.prototype.setState = function(partialState, callback){
    this.updater.enqueueSetState(this, partialState, callback, 'setState');
}

export {Component};