import { DependencyList, EffectCallback, useEffect, useRef } from 'react';

const useEffectOnUpdate: (
  effect: EffectCallback,
  deps?: DependencyList
) => void = (effect, deps) => {
  const componentDidMount = useRef<boolean>(false);

  useEffect(() => {
    if (componentDidMount.current) return effect();
    else componentDidMount.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps as ReadonlyArray<any>);
};

export default useEffectOnUpdate;
