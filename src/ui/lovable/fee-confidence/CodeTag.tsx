interface CodeTagProps {
  children: React.ReactNode;
}

const CodeTag = ({ children }: CodeTagProps) => (
  <span className="fc-code-tag">{children}</span>
);

export default CodeTag;
