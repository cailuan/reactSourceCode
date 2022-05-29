
export const NoFlags = /*                      */ 0b00000000000000000000000;
export const PerformedWork = /*                */ 0b00000000000000000000001;
export const Placement = /*                    */ 0b00000000000000000000010;
export const Update = /*                       */ 0b00000000000000000000100;

export const Callback = /*                     */ 0b00000000000000001000000;

export const Ref = /*                          */ 0b00000000000000100000000;



export const RefStatic = /*                    */ 0b00001000000000000000000;

// todo 其他flags
export const  MutationMask = Placement | Update 


export const LayoutMask = Update | Callback | Ref