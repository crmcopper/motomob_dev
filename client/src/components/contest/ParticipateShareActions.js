import React from "react"

function ParticipateShareActions({ contestsURL, openParticipateModal, buttonText, disabled }) {
  
  const enterContestsAction = (e) => {
    e.preventDefault();
    if (!contestsURL) {
      openParticipateModal()
    } else {
      window.open(contestsURL, '_blank')
    }
  }
  return (
    <button className="btn btn-red participate-button" onClick={(e) => enterContestsAction(e)} disabled={disabled}>
      {buttonText}
    </button>
  )
}

export default ParticipateShareActions
