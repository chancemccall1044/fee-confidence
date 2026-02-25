import type { ReactNode } from "react";

interface CodeTagProps {
  children: ReactNode;
}

const CodeTag = ({ children }: CodeTagProps) => (
  <span className="fc-code-tag">{children}</span>
);

export default CodeTag;