import React from "react"
import PropTypes from "prop-types"
import { Form, Item, Popup } from "semantic-ui-react"

class MultiSearchSelect extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      showOptions: false,
      selected: this.props.selected,
      userInput: "",
    }
  }
  componentWillMount() {
    document.addEventListener("mousedown", this.hide)
    document.addEventListener("keydown", this.escFunction, false)
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.hide)
    document.removeEventListener("keydown", this.escFunction, false)
  }

  componentDidUpdate() {
    // if (this.props.onSelect) {
    //   this.props.onSelect(this.state.selected);
    // }
    if (this.props.onUserInput) {
      this.props.onUserInput(this.state.userInput)
    }
  }
  show = (e) => {
    e.preventDefault()
    this.setState({
      showOptions: true,
    })
  }

  hide = (e) => {
    if (this.wrapperRef && !this.wrapperRef.contains(e.target)) {
      this.setState({
        showOptions: false,
      })
    }
  }
  escFunction = (event) => {
    if (event.keyCode === 27) {
      this.setState({
        showOptions: false,
      })
    }
  }
  handleChange = (e) => {
    e.preventDefault()
    this.setState({
      userInput: e.target.value,
    })
  }
  addTag = (element) => {
    let current = this.props.selected
    let selectedBikes = this.props.selected.filter(
      (r) => r.bikeId === element.id
    )
    if (selectedBikes.length === 0) {
      current.push(element)
      let single = []
      single.push(element)
      this.setState({
        // selected: this.props.multiSelect ? current : single,
        userInput: "",
      })
      this.props.onSelect(this.props.multiSelect ? current : single)
    }
    this.setState({
      showOptions: false,
    })
  }

  removeTag = (i) => {
    let current = this.props.selected
    current.splice(i, 1)
    this.setState({
      ...this.state,
      selected: current,
    })
    this.props.onSelect(current)
  }
  setWrapperRef = (node) => {
    this.wrapperRef = node
  }
  none = () => {
    return
  }

  render() {
    return (
      <div ref={this.setWrapperRef}>
        <div
          className="input-area"
          contentEditable={false}
          onFocus={this.props.searchable ? this.show : this.none}
          onClick={this.props.searchable ? this.none : this.show}
        >
          {this.props.showTags && (
            <div contentEditable={false}>
              {this.props.selected.map((e, i) => {
                return (
                  <div className="tags" key={i}>
                    <Popup
                      content={e.bikename}
                      trigger={
                        <img
                          src={e.image?e.image:e.thumbUrl}
                          alt="slide"
                          width="48"
                          height="48"
                          className="rounded"
                        />
                      }
                      position="bottom left"
                    />
                    <span
                      onClick={(e) => {
                        e.preventDefault()
                        this.removeTag(i)
                      }}
                      className="close-tag"
                    >
                      <img
                        src="/assets/images/icons/close-small.svg"
                        alt="Close"
                        width="8"
                        height="8"
                      />
                    </span>
                  </div>
                )
              })}
            </div>
          )}
          <div className="search-bar">
            {this.props.searchable && (
              <Form.Field className={this.props.error ? "error" : ""}>
                <input
                  type="text"
                  value={this.state.userInput}
                  onChange={this.handleChange}
                  placeholder={this.props.placeholder}
                />
                <span className="svg-icon">
                  <img
                    src="/assets/images/icons/gray/search-input.svg"
                    alt="Search"
                    width="16"
                    height="16"
                  />
                </span>
              </Form.Field>
            )}
            {this.state.showOptions && this.props.options && (
              <div className="option-area">
                <Item.Group>
                  {this.props.options.map((e, i) => {
                    // if (e.label.toLowerCase().indexOf(this.state.userInput.toLowerCase()) > -1) {
                    return (
                      <Item
                        className={
                          this.props.selected.filter((r) => r.bikeId === e.id)
                            .length === 0
                            ? ""
                            : " active"
                        }
                        key={i}
                        onClick={(ev) => {
                          ev.preventDefault()
                          this.addTag(e)
                        }}
                      >
                        <Item.Image
                          size="tiny"
                          src={e.image}
                          alt={e.label}
                          width="115"
                        />
                        <Item.Content>
                          <Item.Header>{e.label}</Item.Header>
                          <Item.Meta>
                            <img
                              src="/assets/images/icons/check-red.svg"
                              alt="check"
                              width="12"
                              height="12"
                              className="align-middle"
                            />{" "}
                            <span className="align-middle">
                              {e.description}
                            </span>
                          </Item.Meta>
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
                                src="/assets/images/icons/check-green.svg"
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
                    // } else {
                    //   return null
                    // }
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

MultiSearchSelect.propTypes = {
  options: PropTypes.array.isRequired,
  optionsContainerHeight: PropTypes.string,
  searchPlaceholder: PropTypes.string,
  selected:
    PropTypes.array /* Tags that phave to be selected on first render */,
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
  onUserInput:
    PropTypes.func /* Function to get values typed by user in Search box */,
}

MultiSearchSelect.defaultProps = {
  optionsContainerHeight: "50vh",
  searchPlaceholder: "Search...",
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

export default MultiSearchSelect
