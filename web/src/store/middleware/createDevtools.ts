import { devtools as _devtools } from 'zustand/middleware';

type Devtools = typeof _devtools;
type DevtoolsOptions = Parameters<Devtools>[1];

export const createDevtools =
  (name: string): Devtools =>
  ((initializer: Parameters<Devtools>[0], options?: DevtoolsOptions) => {
    let enabled = false;

    if (typeof window !== 'undefined') {
      const debug = new URL(window.location.href).searchParams.get('debug');
      enabled = debug?.includes(name) === true;
    }

    if (!enabled) {
      return initializer;
    }

    return _devtools(initializer, {
      ...options,
      name: `NuGetNext_${name}`,
    });
  }) as Devtools;
