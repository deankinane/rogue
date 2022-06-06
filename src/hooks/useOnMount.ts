import { useEffect, useRef } from "react";

export default function useOnMount(action: () => void) {
  const mounted = useRef(false);

  useEffect(() => {
    if (mounted.current) return;

    action();

    mounted.current = true;
  },[])
}
