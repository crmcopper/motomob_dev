import React from "react"

const SearchBikesResultList = ({ bikes, selectUserBike }) => {
  return bikes.map((userBike, key) => (
    <div className="tags" key={key}>
      <img src={userBike.thumbUrl} alt="slide" width="48" height="48" className="rounded" />
      <span onClick={() => selectUserBike(userBike)} className="close-tag">
        <img src="/assets/images/icons/close-small.svg" alt="Close" width="8" height="8" />
      </span>
    </div>
  ))
}

export default SearchBikesResultList
