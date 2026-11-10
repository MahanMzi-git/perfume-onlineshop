import { createContext, useContext } from 'react';

export const VariantCodesContext = createContext<ReadonlyMap<string, string>>(new Map());

export function useVariantCodes() {
  return useContext(VariantCodesContext);
}

export function VariantCode({ code }: { code?: string }) {
  return code ? <bdi dir="auto" className="variant-code"><span className="sr">کد نسخه: </span>{code}</bdi> : null;
}
