import { useEffect, useRef } from "react";
import gsap from "gsap";

export function useGsapEntrance(deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    const children = ref.current.children;
    gsap.fromTo(
      children,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.45, stagger: 0.06, ease: "power2.out" }
    );
  }, deps);

  return ref;
}

export function useGsapFadeIn(deps = []) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current) return;
    gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power1.out" });
  }, deps);

  return ref;
}
