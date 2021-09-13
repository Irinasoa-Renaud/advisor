import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

const useEffectOnMount: (
  effect: EffectCallback,
  deps?: DependencyList
) => void | (() => void | undefined) = (effect, deps) => {
  const componentDidMount = useRef<boolean>(false);

  useEffect(() => {
    if (!componentDidMount.current) return effect();
    else componentDidMount.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effect, ...(deps as ReadonlyArray<any>)]);
};

export default useEffectOnMount;
