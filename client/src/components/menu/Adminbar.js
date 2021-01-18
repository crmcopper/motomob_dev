import React, { useState, useContext } from "react"

import { Link } from "react-router-dom"

function Adminbar(){


    return(
        <>
     

        <div className="ui secondary  menu">
        <Link to="/admin/upload"  className="item" >
          Bike Upload
          </Link>
        <Link to="/admin/sponsor"  className="item" >
        Sponsor
          </Link>
        <Link to="/admin/contest" className="item" >
        Contest
        </Link>
      
      </div>
      </>
    )
}
export default Adminbar