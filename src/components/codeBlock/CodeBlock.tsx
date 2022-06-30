import hljs from "highlight.js/lib/core.js";
import 'highlight.js/styles/a11y-dark.css';  
import { useEffect, useRef } from "react";
import './CodeBlock.css';

export interface CodeBlockProps {
  code: string,
  findFunction?: string
}
export default function CodeBlock({code, findFunction}: CodeBlockProps) {
  const codeblock = useRef<HTMLElement>(null);

  useEffect(() => {
    document.querySelectorAll("pre code").forEach(block => {
      hljs.highlightBlock(block as HTMLElement);
    });
  },[code]);

  useEffect(() => {
    if (codeblock.current !== null) {
      const titles = codeblock.current.getElementsByClassName('hljs-title');
      for(let i=0; i<titles.length; i++) {
        if (titles[i].innerHTML === findFunction) {
          titles[i].scrollIntoView();
          return;
        }
      }
    } 
  }, [findFunction])

  return (
    <div className="codeblock card-style flex-grow-1">
      <pre className="h-100">
        <code ref={codeblock} className="codeblock__code language-solidity">
          {code}
        </code>
      </pre>
    </div>
    
  )
}
