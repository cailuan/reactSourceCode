import ReactSharedInternals from "./ReactSharedInternals";
import { createContext } from "./ReactContext";
import { forwardRef } from "./ReactForwardRef";
import { memo } from "./ReactMemo";
import { REACT_SUSPENSE_TYPE } from "../shared/ReactSymbols";
import {lazy} from './ReactLazy';


export {
  createContext,
  forwardRef,
  memo,
  lazy,
  REACT_SUSPENSE_TYPE as Suspense,
  ReactSharedInternals as __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED,
};
