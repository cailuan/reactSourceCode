import ReactSharedInternals from "../react/ReactSharedInternals";


const {ReactCurrentBatchConfig} = ReactSharedInternals;


export const NoTransition = null;
export function requestCurrentTransition() {
  return ReactCurrentBatchConfig.transition;
}

export function getSuspendedCache(){
  return {

  }
}