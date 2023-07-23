export function transferActualDuration(fiber) {
    let child = fiber.child;
    while (child) {
        // fiber.actualDuration += child.actualDuration;
        child = child.sibling;
    }
}