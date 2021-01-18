import React from "react"
import PropTypes from "prop-types"
import { Form, Icon, Input, Item, Popup } from "semantic-ui-react"

class SearchSelectTripPopup extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showOptions: false,
      selected: this.props.selected,
      userInput: "",
      error: false,
    }
  }
  componentWillMount() {
    this.setInputFocus()
    document.addEventListener("mousedown", this.hide)
    document.addEventListener("keydown", this.escFunction, false)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.hide)
    document.removeEventListener("keydown", this.escFunction, false)
  }
  show = (e) => {
    e.preventDefault()
    this.setState({ showOptions: true, })
    if (document.querySelector(".add-trip")) {
      var element = document.getElementsByClassName("add-trip")[0]
      element.classList.add("box-opned");
    }
  }

  hide = (e) => {
    if (this.wrapperRef && !this.wrapperRef.contains(e.target)) {
      this.setState({ showOptions: false, })
      this.closePopup()
    }
  }
  escFunction = (event) => {
    if (event.keyCode === 27) {
      this.setState({ showOptions: false, })
      this.closePopup()
    }
  }
  handleSearchChange = (e) => {
    e.preventDefault()
    this.props.onTripSearchChange(e.target.value)
    this.setState({
      userInput: e.target.value,
      error: false
    })
  }
  onSelectOption = (element) => {
    this.props.onSelect(element)
    this.closePopup()
  }
  setWrapperRef = (node) => {
    this.wrapperRef = node
  }
  none = () => {
    return
  }

  closePopup = () => {
    if (document.querySelector(".add-trip")) {
      document.querySelector(".add-trip").click()
      if (document.querySelector(".add-trip")) {
        var element = document.getElementsByClassName("add-trip")[0]
        element.classList.remove("box-opned");
      }
    }
  }

  addNewTempTrip = () => {
    if (this.state.userInput !== "") {
      const latest = {
        id: new Date().valueOf(),
        tripName: this.state.userInput
      }
      this.props.addNewTempTrip(latest)
      this.setState({ userInput: "" })
      this.closePopup()
    } else {
      this.setInputFocus()
      this.setState({ error: true })
    }
    this.props.onTripSearchChange("")
  }
  setInputFocus = () => {
    window.setTimeout(function () {
      let test = document.getElementById('userInputtext');
      if (test) {
        document.getElementById('userInputtext').focus();
      }
    }, 0);
  }
  render() {
    const { selected } = this.props;
    return (
      <div ref={this.setWrapperRef}>
        <div
          className="input-area"
          contentEditable={false}
          onFocus={this.props.searchable ? this.show : this.none}
          onClick={this.props.searchable ? this.none : this.show}
        >
          <div className="d-flex justify-content-between">
            <label>Select Trip</label>
            <span>
              <span className="pointer" onClick={() => this.closePopup()}>Close</span>
            </span>
          </div>
          <div className="search-bar">
            {this.props.searchable && (
              <Form.Field className={this.state.error ? "error" : ""}>
                <input
                  tabIndex="1"
                  className={this.state.error ? "error" : ""}
                  type="text"
                  id="userInputtext"
                  value={this.state.userInput}
                  onChange={this.handleSearchChange}
                  placeholder={this.props.placeholder}
                />
                <span onClick={this.addNewTempTrip} className="svg-icon pointer">
                  <img src="/assets/images/icons/plus.svg" className="red-color align-middle" alt="Add" width="16" height="16" />
                  <span className="text-red align-middle"> Add Trip</span>
                </span>
              </Form.Field>
            )}
            {this.state.showOptions && this.props.options.length > 0 && (
              <div className="option-area">
                <Item.Group>
                  {this.props.options.map((e, i) => {
                    return (
                      <Item
                        className={selected.filter((r) => r.tripName.toLowerCase() === e.tripName.toLowerCase()).length === 0 ? "" : " active"}
                        key={i}
                        id="bikeList"
                        onClick={(ev) => { ev.preventDefault(); this.onSelectOption(e); }}
                      >
                        <Item.Content>
                          <Item.Header>{e.tripName}</Item.Header>
                          <Item.Extra>
                            <span className="svg-icon">
                              <img
                                src="/assets/images/icons/gray/check-gray.svg"
                                alt="check"
                                className="gray-color"
                                width="26"
                                height="26"
                              />
                              <img
                                src="/assets/images/icons/check-red.svg"
                                className="green-color"
                                alt="check"
                                width="26"
                                height="26"
                              />
                            </span>
                          </Item.Extra>
                        </Item.Content>
                      </Item>
                    )
                  })}
                </Item.Group>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}

SearchSelectTripPopup.propTypes = {
  options: PropTypes.array.isRequired,
  optionsContainerHeight: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  selected: PropTypes.array /* Tags that phave to be selected on first render */,
  width: PropTypes.string,
  primaryColor: PropTypes.string,
  secondaryColor: PropTypes.string,
  textColor: PropTypes.string,
  textSecondaryColor: PropTypes.string,
  className: PropTypes.string,
  searchable: PropTypes.bool,
  showTags: PropTypes.bool,
  multiSelect: PropTypes.bool,
  onSelect: PropTypes.func.isRequired,
  onUserInput: PropTypes.func /* Function to get values typed by user in Search box */,
}

SearchSelectTripPopup.defaultProps = {
  optionsContainerHeight: "50vh",
  searchPlaceholder: "Search or Add Trip Name",
  selected: [],
  className: "",
  width: "200px",
  primaryColor: "#e1e1e1",
  secondaryColor: "#046fc0",
  textColor: "#000",
  textSecondaryColor: "#fff",
  searchable: true,
  showTags: true,
  multiSelect: true,
}

export default SearchSelectTripPopup
