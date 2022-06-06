import hljs from "highlight.js/lib/core.js";
import 'highlight.js/styles/a11y-dark.css';  
import { useEffect } from "react";
import './CodeBlock.css';

export interface CodeBlockProps {
  code: string
}
export default function CodeBlock({code}: CodeBlockProps) {
  useEffect(() => {
    document.querySelectorAll("pre code").forEach(block => {
      hljs.highlightBlock(block as HTMLElement);
    });
  },[code]);

  return (
    <div className="codeblock card-style flex-grow-1 mb-3">
      <pre className="h-100">
        <code className="codeblock__code language-solidity">
          {code}
        </code>
      </pre>
    </div>
    
  )
}
