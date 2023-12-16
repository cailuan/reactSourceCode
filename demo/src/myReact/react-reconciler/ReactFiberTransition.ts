import ReactSharedInternals from "../shared/ReactSharedInternals";
const {ReactCurrentBatchConfig} = ReactSharedInternals;


export const NoTransition = null;
export function requestCurrentTransition(){
    return ReactCurrentBatchConfig.transition;
}