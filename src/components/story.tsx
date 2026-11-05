import ReactMarkdown from "react-markdown"

export function Story({ markdown, plain = false }: { markdown: string; plain?: boolean }) {
  return (
    <div className={plain ? "story story-plain" : "story"}>
      <ReactMarkdown
        components={{
          a: ({ href, children }) => (
            <a href={href} rel="noreferrer">
              {children}
            </a>
          ),
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  )
}
