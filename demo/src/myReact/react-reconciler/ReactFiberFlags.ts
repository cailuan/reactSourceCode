
export const NoFlags = /*                      */ 0b00000000000000000000000;
export const PerformedWork = /*                */ 0b00000000000000000000001;
export const Placement = /*                    */ 0b00000000000000000000010;
export const Update = /*                       */ 0b00000000000000000000100;
export const PlacementAndUpdate = /*           */ Placement | Update;

export const ChildDeletion = /*                */ 0b00000000000000000010000;

export const Callback = /*                     */ 0b00000000000000001000000;

export const Ref = /*                          */ 0b00000000000000100000000;

export const Passive = /*                      */ 0b00000000000010000000000;
export const LayoutStatic = /*                 */ 0b00010000000000000000000;

export const PassiveStatic = /*                */ 0b00100000000000000000000;

export const RefStatic = /*                    */ 0b00001000000000000000000;
export const MountLayoutDev = /*               */ 0b01000000000000000000000;

export const Snapshot = /*                     */ 0b00000000000001000000000;
// todo 其他flags
export const  MutationMask = Placement | Update 


export const LayoutMask = Update | Callback | Ref

export const PassiveMask = Passive | ChildDeletion;