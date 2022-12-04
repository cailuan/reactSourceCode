import {REACT_PORTAL_TYPE} from '../shared/ReactSymbols'

export function createPortal(children,containerInfo,implementation,key){
    return {
        $$typeof: REACT_PORTAL_TYPE,
        key: key == null ? null : '' + key,
        children,
        containerInfo,
        implementation,
    }
}