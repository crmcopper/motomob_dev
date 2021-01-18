import React, { useEffect, useState } from "react"
import Item from "semantic-ui-react/dist/commonjs/views/Item"
import Checkbox from "semantic-ui-react/dist/commonjs/modules/Checkbox"

const SearchBikesListItem = ({ bike, selected = false, selectUserBike, selectedBikes }) => {
  const [isChecked, setIsChecked] = useState(selected)

  useEffect(() => {
    setIsChecked(selected)
  }, [selected])

  var flag = false
  if (selectedBikes.length < 4) {
    flag = false
  } else {
    flag = true
  }
  return (
    <>
      {bike && (
        <>
          <Item
            onClick={(key, value) => {
              if (!flag) {
                setIsChecked(false)
                selectUserBike(bike)
              }
            }}
          >
            <Item.Image size="tiny" src={bike?.thumbUrl} width="115" />
            <Item.Content>
              <Item.Header>{bike?.bikename}</Item.Header>
              {/*TODO bike followers*/}
              <Item.Meta>
                <span className="align-middle">followers 14K</span>
              </Item.Meta>
              <Item.Extra>
                {!flag ? (
                  <Checkbox
                    checked={isChecked}
                    // onChange={(key, value) => {
                    //   setIsChecked(false)
                    //   selectUserBike(bike)
                    // }}
                  />
                ) : (
                  <Checkbox
                    checked={isChecked}
                    disabled
                    // onChange={(key, value) => {
                    //   setIsChecked(false)
                    //   selectUserBike(bike)
                    // }}
                  />
                )}
              </Item.Extra>
            </Item.Content>
          </Item>
        </>
      )}
    </>
  )
}

export default SearchBikesListItem
