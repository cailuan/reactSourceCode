let index = -1;
const valueStack:any[] = []

export function createCursor(defaultValue){
  return {
    current: defaultValue,
  };
}

export function push(cursor,value,fiber?:any){
  index++;

  valueStack[index] = cursor.current;

  cursor.current = value;
}

export function pop(cursor,fiber){
  cursor.current = valueStack[index];
  valueStack[index] = null;
  index--;
}