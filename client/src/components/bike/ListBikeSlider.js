import React, { useState, useEffect, useRef } from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Lightbox from "react-image-lightbox"
const ListBikeSlider = ({ images }) => {
    const [state, setState] = useState({
        nav1: null,
        nav2: null
    });

    const slider1 = useRef();
    const slider2 = useRef();
    const [photoIndex, setPhotoIndex] = useState(0)
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        setState({
            nav1: slider1.current,
            nav2: slider2.current
        });
    }, []);

    const {
        nav1,
        nav2
    } = state;
 
    let infinite = true
    let centermode = false
    let centerpadding = false
    let imglen = 4;
    let sliderClass = 'thumbnail';
  
    if(images.length <= 4){
        infinite = false
      }
    if (imglen > 3) {
        sliderClass = 'thumbnail';
    }
    else if (imglen > 2) {
        sliderClass = 'thumbnail slider-three';
        centermode = true;
        centerpadding = '82px';
    }
    else if (imglen > 1) {
        sliderClass = 'thumbnail slider-two';
    }
    else {
        sliderClass = 'thumbnail slider-one';
    }

    return (
        <>
            {isOpen && (
              <Lightbox
                mainSrc={images[photoIndex]}
                nextSrc={images[(photoIndex + 1) % images.length]}
                prevSrc={images[(photoIndex + images.length - 1) % images.length]}
                onCloseRequest={() => setIsOpen(false)}
                onMovePrevRequest={() =>
                    setPhotoIndex((photoIndex + images.length - 1) % images.length)
                }
                onMoveNextRequest={() =>
                    setPhotoIndex((photoIndex + 1) % images.length)
                }
              />
            )}

            <Slider
                asNavFor={nav2}
                ref={slider => (slider1.current = slider)}
                arrows={false}
            >

                {images && images.length &&
                    images.map((img, i) => {
                        return (
                            <div key={i}>
                                <img className="cursor-pointer" onClick={() => {setPhotoIndex(i);setIsOpen(true)}} src={img} alt="slide" width="544" height="340"/>
                            </div>
                        )
                    })
                }
            </Slider>
            <Slider
                asNavFor={nav1}
                ref={slider => (slider2.current = slider)}
                slidesToShow={imglen}
                arrows={true}
                swipeToSlide={true}
                focusOnSelect={true}
                className={sliderClass}
                infinite={infinite}
                centerMode={centermode}
                centerPadding={centerpadding}
            >

                {images && images.length &&
                    images.map((img, i) => {
                        return (
                            <div key={"thumbnail_" + i}>
                                <img src={img} alt="slide" width="544" height="340"

                                />
                            </div>
                        )
                    })
                }
            </Slider>
        </>
    )
}
export default ListBikeSlider
