import React from "react"
import Lottie from "react-lottie"
import animationData from "../util/login-bg"

export default class LottieControl extends React.Component {
  constructor(props) {
    super(props)
    this.state = { speed: 0.5 }

  }
  componentWillMount() {
    this.setState({}, _ => this.setSpeed())
  }
  setSpeed() {
    this.setState({ speed: 0.5 })
  }
  render() {
    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: animationData,

      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice"
      }
    }
    return <Lottie options={defaultOptions} speed={this.state.speed} isClickToPauseDisabled={true} />
  }
}
