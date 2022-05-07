export function createCursor(defaultValue){
  return {
    current: defaultValue,
  };
}

export function push(cursor,value){
  cursor.current = value;
}