import { useState, useEffect, useRef } from "react"
export const useForm = (callback, initialState = {}) => {
  const [values, setValues] = useState(initialState)

  const onChange = event => {
    let value = event.target.value
    if (event.target.name === "days") {
      value = (event.target.value).replace(/\D/g, '')
    }
    setValues({ ...values, [event.target.name]: value })
  }

  //TODO: What crap is this?
  const onChangeCustom = (e, data, name) => {

    if (name === "location") {
      setValues({ ...values, [name]: e.formatted_address })
      //setValues({ ...values, [name]: data.value })
    } else if (name === "offRoadPercentage") {
      setValues({ ...values, [name]: e })
    } else if (name === "mobile") {
      setValues({ ...values, [name]: e })
    } else if (name === "postag") {
      setValues({ ...values, [name]: data.value })
    } else {
      //setValues({ ...values, [name]: value.value })
    }
  }
  const onRadioChange = (event, value, name) => {
    setValues({ ...values, [name]: value.value })
  }

  const onSubmit = event => {
    // debugger
    if (event) {
      event.preventDefault()
    }
    callback()
  }

  return {
    onChange,
    onChangeCustom,
    onSubmit,
    values,
    onRadioChange
  }
}

const isClient = typeof window === "object"

export const useInfiniteScroll = callBackFunc => {
  const [isFetching, setIsFetching] = useState(false)

  useEffect(() => {
    if (isClient) {
      const handleScroll = () => {
        // check if we are at bottom of scroll or not
        //       console.log(Math.round(window.innerHeight + document.documentElement.scrollTop))
        //       console.log(Math.round(document.scrollingElement?.scrollHeight))
        var windowscroller = Math.round(window.innerHeight + document.documentElement.scrollTop)
        var MainScroller = Math.round(document.scrollingElement?.scrollHeight)
        if (windowscroller === MainScroller || windowscroller + 1 === MainScroller) {
          setIsFetching(true)
        } else {
          setIsFetching(false)
        }
      }
      window.addEventListener("scroll", handleScroll)
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  useEffect(() => {
    // allow user to cancle the callback by setting isFetching to 'false'
    if (!isFetching) return
    if (callBackFunc) {
      callBackFunc()
    }
  }, [callBackFunc, isFetching])

  return [isFetching, setIsFetching]
}

export const usePrevValue = state => {
  // ref as a instance property
  const ref = useRef()

  // run effect on every re-render
  useEffect(() => {
    ref.current = state
  })

  return ref.current
}
