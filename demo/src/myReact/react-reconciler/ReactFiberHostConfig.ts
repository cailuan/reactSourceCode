export function shouldSetTextContent(type,props){
  return typeof props.children === 'string' || typeof props.children === 'number'
}

function handleErrorInNextTick(error){
  setTimeout(()=>{
    throw error
  })
}



export const scheduleMicrotask = typeof queueMicrotask == 'function' ? queueMicrotask : typeof Promise != 'undefined' ? (callback)=> Promise.resolve(null).then(callback).catch(handleErrorInNextTick) : setTimeout