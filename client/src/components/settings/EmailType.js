import React, { useContext } from "react"
import { Button } from "semantic-ui-react"
import { AuthContext } from "../../context/auth"
import { SAVE_NOTIFICATION_FREQUENCY, FETCH_USER_QUERY } from "../../common/gql_api_def"
import { useMutation } from "@apollo/client"

const EmailType = ({ userId, type, label, isActive }) => {
  const context = useContext(AuthContext)

  const [saveNotificationFrequency] = useMutation(SAVE_NOTIFICATION_FREQUENCY, {
    update(store, { data }) {
      if (type !== data.saveNotificationFrequency.notificationFrequency) {
        var elems = document.querySelector(".active");
        if (elems !== null) {
          elems.classList.remove("active");
        }
      }

      context.login(data.saveNotificationFrequency, false)
      store.writeQuery({
        query: FETCH_USER_QUERY,
        variables: { userId },
        data: {
          getUser: data.saveNotificationFrequency
        }
      })

    },

    variables: { frequency: type }
  })

  return (
    <>
      <Button basic color='red' className={isActive === type ? "active" : ""} onClick={() => saveNotificationFrequency()}>{label}</Button>
    </>

  )
}

export default EmailType
