import React from "react"

function Criteria({ contestId }) {
  const __html = require(`./content/criteria/${contestId}`);
  const template = { __html: __html };

  return (
    <div>
      {contestId ? (
        <div dangerouslySetInnerHTML={template} />
      ): (
        <span>Criteria are not found</span>
      )}
    </div>
  )
}

export default Criteria
