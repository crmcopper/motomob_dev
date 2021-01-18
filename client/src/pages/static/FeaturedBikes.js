import React from "react"
import { Link } from "react-router-dom"

const FeaturedBikes = () => {
  return (
    <div>
      <h2 className="main-title">Featured Bikes</h2>
      <div>
        <div className="ui grid">
          <div className="eight wide column">
            <div className="ui featured-bike-card mb-15">
              <Link style={{ color: "rgb(51, 51, 51)" }} to="/bike/5f3832286b86c04c2865fecd" >
                <div className="featured-image-blk">
                  <img src="/assets/images/bike-1.png" className="img-fluid" />
                </div>
                <div className="featured-content-blk">
                  <div className="featured-content">
                    <h4>BMW R 1250 GS Adventure - 2020</h4>
                    <p>2020</p>
                  </div>
                  <div className="featured-dots">
                    <img src="/assets/images/icons/dots-horizontal-grey.svg" />
                  </div>
                </div>
              </Link>
            </div>
            <div className="ui featured-bike-card">
              <Link style={{ color: "rgb(51, 51, 51)" }} to="/bike/5f37eec26b86c04c2865de4b" >
                <div className="featured-image-blk">
                  <img src="/assets/images/bike-2.png" className="img-fluid" />
                </div>
                <div className="featured-content-blk">
                  <div className="featured-content">
                    <h4>KTM 790 Adventure R - 2019</h4>
                    <p>2019</p>
                  </div>
                  <div className="featured-dots">
                    <img src="/assets/images/icons/dots-horizontal-grey.svg" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
          <div className="eight wide column stackable">
            <div className="ui featured-bike-card">
              <Link style={{ color: "rgb(51, 51, 51)" }} to="/bike/5f47d89d43b117449c91a346" >
                <div className="featured-image-blk">
                  <img src="/assets/images/bike-3.png" className="img-fluid" />
                </div>
                <div className="featured-content-blk">
                  <div className="featured-content">
                    <h4>Royal Enfield Himalayan - 2018</h4>
                    <p>2018</p>
                  </div>
                  <div className="featured-dots">
                    <img src="/assets/images/icons/dots-horizontal-grey.svg" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
          <div className="sixteen wide column pt-0">
            <div className="ui featured-bike-card">
              <Link style={{ color: "rgb(51, 51, 51)" }} to="/bike/5f37eeb96b86c04c2865b8b1" >
                <div className="featured-image-blk">
                  <img src="/assets/images/bike-4.png" className="img-fluid" />
                </div>
                <div className="featured-content-blk">
                  <div className="featured-content">
                    <h4>BMW R NineT Urban GS - 2018</h4>
                    <p>2018</p>
                  </div>
                  <div className="featured-dots">
                    <img src="/assets/images/icons/dots-horizontal-grey.svg" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
          <div className="eight wide column pt-0">
            <div className="ui featured-bike-card">
              <Link style={{ color: "rgb(51, 51, 51)" }} to="/bike/5f3832286b86c04c2865fece" >
                <div className="featured-image-blk">
                  <img src="/assets/images/bike-5.png" className="img-fluid" />
                </div>
                <div className="featured-content-blk">
                  <div className="featured-content">
                    <h4>Yamaha Tenere 700 - 2020</h4>
                    <p>2020</p>
                  </div>
                  <div className="featured-dots">
                    <img src="/assets/images/icons/dots-horizontal-grey.svg" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
          <div className="eight wide column pt-0">
            <div className="ui featured-bike-card mb-15">
              <Link style={{ color: "rgb(51, 51, 51)" }} to="/bike/5f3832286b86c04c2865fed5" >
                <div className="featured-image-blk">
                  <img src="/assets/images/bike-6.png" className="img-fluid" />
                </div>
                <div className="featured-content-blk">
                  <div className="featured-content">
                    <h4>Husqvarna 701 Enduro - 2019</h4>
                    <p>2019</p>
                  </div>
                  <div className="featured-dots">
                    <img src="/assets/images/icons/dots-horizontal-grey.svg" />
                  </div>
                </div>
              </Link>
            </div>
            <div className="ui featured-bike-card">
              <Link style={{ color: "rgb(51, 51, 51)" }} to="/bike/5f37eec46b86c04c2865ee5c" >
                <div className="featured-image-blk">
                  <img src="/assets/images/bike-7.png" className="img-fluid" />
                </div>
                <div className="featured-content-blk">
                  <div className="featured-content">
                    <h4>Triumph Daytona MOTO2 765 - 2020</h4>
                    <p>2020</p>
                  </div>
                  <div className="featured-dots">
                    <img src="/assets/images/icons/dots-horizontal-grey.svg" />
                  </div>
                </div>
              </Link>
            </div>
          </div>

          <div className="sixteen wide column pt-0">
            <div className="ui featured-bike-card">
              <Link style={{ color: "rgb(51, 51, 51)" }} to="/bike/5f3832286b86c04c2865fecb" >
                <div className="featured-image-blk">
                  <img src="/assets/images/bike-8.png" className="img-fluid" />
                </div>
                <div className="featured-content-blk">
                  <div className="featured-content">
                    <h4>Honda Africa Twin CRF1000L - 2018</h4>
                    <p>2018</p>
                  </div>
                  <div className="featured-dots">
                    <img src="/assets/images/icons/dots-horizontal-grey.svg" />
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
export default FeaturedBikes
