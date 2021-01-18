import React, { Fragment, useEffect, useState, useContext } from "react"
import Grid from "semantic-ui-react/dist/commonjs/collections/Grid"
import { useLazyQuery, useMutation } from "@apollo/client"
import { FETCH_BIKE_BY_NAME_QUERY, ADD_BIKES, FETCH_USER_OWN_BIKES_QUERY, FETCH_USER_FOLLOW_BIKES_QUERY } from "../../common/gql_api_def"
import { Button, Dimmer, Form, Loader, Modal } from "semantic-ui-react"
import Item from "semantic-ui-react/dist/commonjs/views/Item"

import SearchBikesListItem from "../bike/SearchBikesListItem"
import SearchBikesResultList from "../bike/SearchBikesResultList"

import { AuthContext } from "../../context/auth"
let newSelectedBike = [];
const AddBike = ({ userId, userBikes = [], userEditBikesMutation, title }) => {
  const [searchValue, setSearchValue] = useState("")
  const [selectedBikes, setSelectedBikes] = useState([])
  const [openBikeAddModal, setOpenBikeAddModal] = useState(false)
  const { user } = useContext(AuthContext)
  const context = useContext(AuthContext)
  const [searchBikeByName, { loading, data }] = useLazyQuery(FETCH_BIKE_BY_NAME_QUERY)


  const [addBikes, { loading: editUserBikesLoading }] = useMutation(ADD_BIKES, {
    update(store, { data }) {
      setOpenBikeAddModal(false)
      setSelectedBikes([])
      newSelectedBike = []
      setSearchValue("")
      if (data && data.addBikes != undefined) {
        context.login(data.addBikes, false)
      }

      store.writeQuery({
        query: FETCH_USER_OWN_BIKES_QUERY,
        variables: { userId: userId },
        data: {
          getUserOwnBikes: [data.addBikes.ownBikes],

        }
      })

      store.writeQuery({
        query: FETCH_USER_FOLLOW_BIKES_QUERY,
        variables: { userId: userId },
        data: {
          getUserFollowBikes: [data.addBikes.followBikes]
        }
      })

    },
    onError(err) {
      console.log(err)
    },
    variables: { bikes: newSelectedBike, type: title }
  })


  const selectUserBike = bike => {

    if (selectedBikes.find(selectedBike => selectedBike.id === bike.id)) {
      selectedBikes.map((selectedBike, key) => {
        if (selectedBike.id === bike.id) {
          selectedBikes.splice(key, 1)
        }
      })
      setSelectedBikes([...selectedBikes])
    } else {
      const bikeId = bike.id
      const selectedBike = {
        bikeId: bikeId,
        ...bike
      }

      setSelectedBikes([...selectedBikes, selectedBike])

    }
    //---- when call add mutation this time we have used newSelectedBike
    if (newSelectedBike.find(selectBike => selectBike.bikeId === bike.id)) {
      newSelectedBike.map((selectBike, k) => {
        if (selectBike.bikeId === bike.id) {
          newSelectedBike.splice(k, 1)
        }
      })

    } else {
      newSelectedBike.push({
        bikeId: bike.id,
        bikename: bike.bikename,
        thumbUrl: bike.thumbUrl,
        prodStartYear: bike.prodStartYear
      })
    }

  }


  const handleChange = (e) => {
    setSearchValue(e.target.value)
    searchBikeByName({ variables: { bikename: e.target.value } })
  }

  useEffect(() => {
    searchBikeByName({ variables: { bikename: searchValue } })
  }, [])

  return (
    <Modal
      // className="add-bike-modal"
      size={"tiny"}
      closeIcon
      
      open={openBikeAddModal}
      onClose={() => { setOpenBikeAddModal(false); setSelectedBikes([]); newSelectedBike = []; setSearchValue("") }}
      onOpen={() => setOpenBikeAddModal(true)}
      trigger={
        <Grid.Column mobile={16} tablet={8} computer={8}>
          <div className="bordered-bx pointer">
            <div className="add-bike">
              <span className="svg-icon">
                <img src="/assets/images/icons/gray/plus.svg" className="gray-color" alt="Add" width="22" height="21" />
                <img src="/assets/images/icons/plus.svg" className="red-color" alt="Add" width="22" height="21" />
              </span>
              <div className="text-light">Add a bike</div>
            </div>
          </div>
        </Grid.Column>
      }
    >
      <Modal.Header>
        <Form onSubmit={addBikes} noValidate autoComplete="off">
          <h2>{title} a bike</h2>
          <Form.Input
            placeholder="Search a bike"
            name="bikename"
            type="text"
            value={searchValue}
            disabled={editUserBikesLoading}
            onChange={handleChange}
          />
        </Form>
        {!!selectedBikes?.length && <SearchBikesResultList bikes={selectedBikes} selectUserBike={selectUserBike} />}
      </Modal.Header>
      <Modal.Content scrolling className="add-bike-modal-container">
        <Modal.Description>
          {loading || editUserBikesLoading ? (
            <Dimmer active>
              <Loader />
            </Dimmer>
          ) : data?.getBikeByName?.length ? (
            <Item.Group>
              {data.getBikeByName.map((bike, key) => (
                <Fragment key={key}>
                  {!userBikes.find(userBike => userBike.bikeId === bike.id) && (
                    <SearchBikesListItem
                      bike={bike}
                      selectUserBike={selectUserBike}
                      selectedBikes={selectedBikes}
                      selected={!!selectedBikes.find(selectedBike => selectedBike.id === bike.id)}

                    />
                  )}
                </Fragment>
              ))}
            </Item.Group>
          ) : (
                <div>No bikes found matching the search criteria</div>
              )}
        </Modal.Description>
      </Modal.Content>
      <Modal.Actions>
        <Grid>
          <Grid.Column textAlign="center">
            <Button type="submit" color="red" onClick={addBikes} disabled={!selectedBikes?.length || editUserBikesLoading}>
              Add
            </Button>
          </Grid.Column>
        </Grid>
      </Modal.Actions>
    </Modal>
  )
}

export default AddBike
