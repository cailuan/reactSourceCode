import { requestEventTime } from "../react-reconciler/ReactFiberWorkLoop";
import { peek, pop, push } from "./SchedulerMinHeap";
import { NormalPriority } from "./SchedulerPriorities";

var IMMEDIATE_PRIORITY_TIMEOUT = -1;
// Eventually times out
var USER_BLOCKING_PRIORITY_TIMEOUT = 250;
var NORMAL_PRIORITY_TIMEOUT = 5000;
var LOW_PRIORITY_TIMEOUT = 10000;

var taskIdCounter = 1;
var taskQueue = [];
var timerQueue = [];

var isHostCallbackScheduled = false;
var isPerformingWork = false;

let scheduledHostCallback:any = null
let schedulePerformWorkUntilDeadline

let yieldInterval = 5;
let deadline = 0;

var currentTask:any = null;

var currentPriorityLevel =  NormalPriority

let getCurrentTime = () => performance.now();

function advanceTimers(currentTime){
  let timer = peek(timerQueue)
  while(timer != null){
    if(timer.callback === null){
      pop(timerQueue)
    }else if(timer.startTime <= currentTime){
      pop(timerQueue)
      timer.sortIndex = timer.expirationTime;
      push(taskQueue,timer)
    }else{
      return
    }
    timer = peek(timerQueue)
  }
}

const performWorkUntilDeadline = ()=>{
  // 初次执行 flushWork
  if(scheduledHostCallback != null){
    console.log('performWorkUntilDeadline performWorkUntilDeadline')
    const currentTime = getCurrentTime()
    const hasTimeRemaining = true;
    deadline = currentTime + yieldInterval
    let hasMoreWork  = true
    try{
      hasMoreWork = scheduledHostCallback(hasTimeRemaining ,currentTime)
      
    }finally{
      if(hasMoreWork){
        // 过期时间大于当前时间 && 当前时间大于currentTime+5
        schedulePerformWorkUntilDeadline()

      }else{
        scheduledHostCallback = null
      }
    }
  }
  

}

if(typeof setImmediate === 'function'){
  schedulePerformWorkUntilDeadline = ()=>{
    setImmediate(performWorkUntilDeadline)
  }
  
}else if (typeof MessageChannel != 'undefined'){
  const channel = new MessageChannel()
  const port = channel.port2
  channel.port1.onmessage = performWorkUntilDeadline
  schedulePerformWorkUntilDeadline = ()=>{
    port.postMessage(null)
  }
}else{
  schedulePerformWorkUntilDeadline = ()=>{
    setTimeout(performWorkUntilDeadline,0);
  }
}


export function scheduleCallback(priorityLevel, callback){
  var currentTime = requestEventTime()
  var startTime = currentTime
  var timeout 
  switch(priorityLevel){
    case NormalPriority:
    default:
      timeout = NORMAL_PRIORITY_TIMEOUT
      break
  }
  var expirationTime = startTime + timeout;

  var newTask = {
    id : taskIdCounter++,
    callback : callback,
    priorityLevel:priorityLevel,
    startTime:startTime,
    expirationTime: expirationTime,
    sortIndex: -1
  }


  newTask.sortIndex = expirationTime
  push(taskQueue,newTask)
  
  if(!isHostCallbackScheduled && !isPerformingWork){
    isHostCallbackScheduled = true;
    console.log('unstable_scheduleCallback')
    requestHostCallback(flushWork)
  }
  

  return newTask
} 

function flushWork(hasTimeRemaining, initialTime){
   isHostCallbackScheduled = false
   isPerformingWork = true;
   console.log('flushWork')
   try{
    return workLoop(hasTimeRemaining, initialTime)
   }finally {
    isPerformingWork = false;
   }
  
}

function requestHostCallback(callback){
  scheduledHostCallback = callback
  schedulePerformWorkUntilDeadline()

}

function shouldYieldToHost(){
  return getCurrentTime() >= deadline

}

function workLoop(hasTimeRemaining, initialTime){
  let currentTime = initialTime;
  advanceTimers(currentTime)
  currentTask = peek(taskQueue)
  while(currentTask != null){
    
    if(currentTask.expirationTime > currentTime && (!hasTimeRemaining || shouldYieldToHost())){
      break;
    }
    var callback = currentTask.callback;

    if (typeof callback === 'function'){
      currentTask.callback = null
      currentPriorityLevel = currentTask.priorityLevel
      const didUserCallbackTimeout =  currentTime >= currentTask.expirationTime
      
      var continuationCallback = callback(didUserCallbackTimeout)
      if(currentTask ===  peek(taskQueue)){
        pop(taskQueue)
      }
      
    }else{
      pop(taskQueue)
    }
    currentTask = peek(taskQueue)
  }

  if(currentTask != null){
    return true
  }else{
    return false
  }

}