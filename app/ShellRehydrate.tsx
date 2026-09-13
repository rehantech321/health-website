'use client';

import { useEffect } from 'react';

// The shell is an HTML string applied with dangerouslySetInnerHTML. Whenever
// React re-applies it - Fast Refresh after an edit to lib/shared-body.ts is
// the common case - every <option>, counter and account state that
// public/eldava-app.js had written into the DOM is wiped, and the script
// itself does not run again. This effect has no dependency array on purpose:
// it runs after every render of the shell and asks the script to redo its DOM
// setup. In production the shell renders once, so this is effectively a no-op.
export function ShellRehydrate() {
  useEffect(() => {
    const w = window as unknown as { Eldava?: { rehydrate?: () => void } };
    w.Eldava?.rehydrate?.();
  });
  return null;
}
