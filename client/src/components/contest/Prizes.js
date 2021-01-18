import React from "react"


function Prizes({ contestId }) {
  const __html = require(`./content/prizes/${contestId}`);
  const template = { __html: __html };

  return (
    <div>
      {contestId ? (
        <div dangerouslySetInnerHTML={template} />
      ): (
        <span>Prizes are not found</span>
      )}
    </div>
  )
}

export default Prizes
