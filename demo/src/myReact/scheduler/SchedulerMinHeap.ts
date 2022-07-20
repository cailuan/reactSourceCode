export function push (heap,node){
  const index = heap.length;
  heap.push(node)
  siftUp(heap,node,index)
}

export function pop(heap){
  if(heap.length == 0) return null
  const first = heap[0]
  const last = heap.pop()
  if(first != last ){
    heap[0] = last
    siftDown(heap,last,0)
  }
  return first 
}

export function peek(heap){
  return heap.length == 0 ? null : heap[0]
}

function siftUp(heap, node, i){
  let index = i
  while(index > 0){
    const parentIndex = (index - 1) >>> 1
    const parent = heap[parentIndex];
    if(compare(parent , node) > 0){
      [heap[parentIndex],heap[index]] = [heap[index] , heap[parentIndex]]
      index = parentIndex
    }else{
      return
    }
  }
}

function siftDown(heap,last,i){
  let index = i
  const length = heap.length
  while(index < length){
    const leftIndex = 2 * (index + 1) - 1
    const left = heap[leftIndex]
    const rightIndex = leftIndex + 1
    const right = heap[rightIndex]
    if(left && compare(last,left) > 0){
      if(right && compare(right,left) > 0){
        [heap[index],heap[leftIndex]] = [heap[leftIndex],heap[index]]
        index = leftIndex
      }else{
        [heap[index],heap[rightIndex]] = [heap[rightIndex],heap[index]]
        index = rightIndex
      }

    }else if (right && compare(last,right) > 0){
      [heap[index],heap[rightIndex]] = [heap[rightIndex],heap[index]]
      index = rightIndex
    }else{
      return
    }
  }

}

function compare(a,b){
  const diff = a.sortIndex - b.sortIndex;
  return diff != 0 ? diff : a.id - b.id
}