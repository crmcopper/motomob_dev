import React from "react"
import ParticipateShareActions from "./ParticipateShareActions"
import { sponsorsList } from "../../util/Constants"
import moment from "moment"

function ContestsListItem(props) {
  const { contestsClosed,
    contest: { title, imageUrl, closingDate, sponsors, id },
    openShareModal
  } = props
  const locationUrl = contestsClosed ? window.location.href + "/contestsClosed/" + id : window.location.href + "/" + id
  return (
    <div className="contest-item" style={{ backgroundImage: `url(${imageUrl})` }}>
      <div className="container-layer-overlay" />
      <button className="actions-share pointer" onClick={(e) => openShareModal(imageUrl, title, locationUrl, e)}>
        <img
          src="/assets/images/icons/share-white-icon.svg"
          alt="Followers"
          width="20"
          height="20"
        />
      </button>
      <div className="content-centered-block">
        <div className="content-block">
          <div className="text-center">
            <div className="contest-title">{title}</div>
            <div className="contest-subtitle">{`Closing on the ${moment(closingDate).format("YYYY-MM-DD")}`}</div>
            <ParticipateShareActions
              buttonText={contestsClosed ? " View Contest" : "Enter Contest"}
              openShareModal={openShareModal}
              imageUrl={imageUrl}
              title={title}
              url={locationUrl}
              contestsURL={contestsClosed ? `/photo-contests/${contestsClosed}/${id}` : `/photo-contests/${id}`}
              displayRemaing={false}
            />
          </div>
        </div>
        <div className="contest-sponsors">
          <span>Sposored by</span>
          <div className="sponsors-logos">
            {sponsors.map((sponsor, index) => {
              return (
                <div className="sponsor-logo-container" key={index}>
                  <img src={sponsor.imageUrl} alt={sponsor.name} />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ContestsListItem
