// A transparent avatar hotspot must not steal a tap aimed at a plant underneath.
// Keep wardrobe taps working whenever no item occupies that exact screen point.
export function itemBeforeAvatar(target, hitStack) {
 if (!target.closest('[data-avatar]')) return target;
 return hitStack.find(node => node.closest('[data-id]')) || target;
}
