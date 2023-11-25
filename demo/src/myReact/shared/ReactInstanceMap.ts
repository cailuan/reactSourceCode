import { findCurrentFiberUsingSlowPath } from "./ReactFiberTreeReflection"

export function findCurrentHostFiberWithNoPortals(parent){
  
  var currentParent = findCurrentFiberUsingSlowPath(parent)
  findCurrentHostFiberWithNoPortalsImpl(currentParent)
  return null
}

function findCurrentHostFiberWithNoPortalsImpl(node){
  return null
}

export function remove(key) {
  key._reactInternals = undefined;
}

export function get(key) {
  return key._reactInternals;
}

export function has(key) {
  return key._reactInternals !== undefined;
}

export function set(key, value) {
  key._reactInternals = value;
}