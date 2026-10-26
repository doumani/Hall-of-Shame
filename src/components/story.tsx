import ReactMarkdown from "react-markdown"

export function Story({ markdown }: { markdown: string }) {
  return (
    <div className="story">
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
