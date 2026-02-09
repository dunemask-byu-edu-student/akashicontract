import { ReactNode } from "react";

export default function Conditional(props: { children?: ReactNode[] | ReactNode | undefined; if: boolean }) {
  if (!props.if) return;
  return props.children;
}
