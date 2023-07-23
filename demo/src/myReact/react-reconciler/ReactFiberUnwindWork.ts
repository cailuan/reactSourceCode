import { DidCapture, ShouldCapture } from "./ReactFiberFlags";
import { popSuspenseHandler } from "./ReactFiberSuspenseContext";
import { transferActualDuration } from "./ReactProfilerTimer";
import { NoMode, ProfileMode } from "./ReactTypeOfMode";
import { LegacyHiddenComponent, OffscreenComponent, SuspenseComponent } from "./ReactWorkTags";

export function unwindWork(current, workInProgress, renderLanes) {
    switch (workInProgress.tag) {
        case OffscreenComponent:
        case LegacyHiddenComponent:{
            popSuspenseHandler(workInProgress);
            const flags = workInProgress.flags;
            if(flags & ShouldCapture){
                workInProgress.flags = (flags & ~ShouldCapture) | DidCapture

                return workInProgress
            }
            return null;
        }
        case SuspenseComponent:{
                popSuspenseHandler(workInProgress);
                const suspenseState =  workInProgress.memoizedState;
                const flags = workInProgress.flags;
                if(flags & ShouldCapture ){
                    workInProgress.flags = (flags & ~ShouldCapture) | DidCapture;
                    if( (workInProgress.mode & ProfileMode) !== NoMode){
                        transferActualDuration(workInProgress)
                    }
                    return workInProgress;
                }

                return null
            }
         

        default:
            return null;
    }
}