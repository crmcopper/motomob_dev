import React, { useState, useContext } from "react"
import { Modal, Grid, Form, Button, Input } from "semantic-ui-react"

import NotLoggedInModal from "../contest/NotLoggedInModal"
import TextareaAutosize from "react-textarea-autosize"
import { AuthContext } from "../../context/auth"
import { CREATE_FEEDBACK_MUTATION } from "../../common/gql_api_def"
import { useMutation } from "@apollo/client"
import { useForm } from "../../util/hooks"

const styles = {
  padding: "7px 1rem"
}
export const Feedback = () => {
  const [openFeedbackModal, setOpenFeedbackModal] = useState(false)
  const [isWarningModalOpen, setWarningModalOpen] = useState(false)
  const [errors, setErrors] = useState({})
  const [showMessage, setShowMessage] = useState(true)

  const { user } = useContext(AuthContext)

  const { values, onChange, onSubmit } = useForm(createFeedbackCallback, {
    pageLink: window.location.href,
    description: ""
  })

  const [createFeedback] = useMutation(CREATE_FEEDBACK_MUTATION, {
    variables: values,
    update: (store, { data }) => {
      setShowMessage(false)
      values.description = ""
    },
    onError(err) {
      console.log(err)
      setErrors(err.graphQLErrors[0].extensions.exception.errors)
    }
  })

  function createFeedbackCallback() {
    if (values.description) {
      //Update only if there is a value
      createFeedback()
    } else {
      //just close the modal
      setShowMessage(false)
    }
  }

  const closeWarningModal = () => {
    setWarningModalOpen(false)
  }

  const closeModal = () => {
    setOpenFeedbackModal(false)
    setShowMessage(true)
  }

  return (
    <Modal
      className=""
      size={"small"}
      closeIcon
      open={openFeedbackModal}
      onClose={() => closeModal()}
      onOpen={() => setOpenFeedbackModal(true)}
      trigger={
        <Grid.Column mobile={16} tablet={8} computer={8}>
          <Button className="text-light report-bug-btn">
            <span>Share Feedback</span>
            <img src="/assets/images/icons/feedback.svg" alt="Bikes" />
          </Button>
        </Grid.Column>
      }
    >
      <Modal.Header className="text-center">
        <div className="header">Share feedback with us...</div>
      </Modal.Header>
      <Modal.Content scrolling className="">
        <Modal.Description>
          {showMessage ? (
            <Form onSubmit={onSubmit} className="">
              <Form.Field className={errors?.pageLink ? "error" : ""}>
                <Input type="text" value={values.pageLink} disabled={true} name="pageLink" className="fixsize" />
              </Form.Field>
              <Form.Field className={errors?.description ? "error" : ""}>
                <TextareaAutosize
                  type="text"
                  placeholder="Add description here.."
                  value={values.description}
                  name="description"
                  maxRows={8}
                  // error={errors?.description ? true : false}
                  onChange={onChange}
                  maxHeight={"100px"}
                  style={styles}
                  maxlength={500}
                />
              </Form.Field>
              <Grid className="post-btn-wrapper">
                <Grid.Column>
                  {Object.keys(errors).length > 0 && (
                    <div className="ui error message" style={{ display: "block" }}>
                      <ul className="list">
                        {Object.values(errors).map(value => (
                          <li key={value}>{value}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Grid.Column>
              </Grid>
              <Grid className="post-btn-wrapper">
                <Grid.Column textAlign="center">
                  <Button
                    type="submit"
                    color="red"
                    onClick={e => {
                      if (!user) {
                        e.preventDefault()
                        setWarningModalOpen(true)
                      }
                    }}
                  >
                    Share
                  </Button>
                </Grid.Column>
              </Grid>
              <Modal onClose={closeWarningModal} open={isWarningModalOpen} className="warning-modal" size="small">
                <NotLoggedInModal closeModal={closeWarningModal} />
              </Modal>
            </Form>
          ) : (
            <div className="text-center form-height">
              <span className="thankyou-text">Thank you for sharing your thoughts!</span>
              <Grid className="post-btn-wrapper">
                <Grid.Column textAlign="center">
                  <Button type="button" color="red" onClick={() => closeModal()}>
                    Close
                  </Button>
                </Grid.Column>
              </Grid>
            </div>
          )}
        </Modal.Description>
      </Modal.Content>
    </Modal>
  )
}
