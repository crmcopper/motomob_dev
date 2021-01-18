import React, { useMemo, useState } from "react"
import { Button, Form, Grid, Image } from "semantic-ui-react"
import { brands, categories } from "../../util/Constants"
import DropzoneUploadDisplay from "../util/DropzoneUploadDisplay"
import CustomDropzone from "../util/CustomDropzone"

const UploadBike = ({ bike = null, onSubmit, onChange, values, loading, errors, setImage, image, selectedBikesImages, setSelectedBikesImages }) => {
  const [brand, setBrand] = useState(values.brand || "")
  const [category, setCategory] = useState(values.category || "")
  const [isActive, setIsActive] = useState(values.isActive)

  const setThumbnail = image => {
    setImage(image)
  }

  const setBikesPhotos = images => {
    setSelectedBikesImages(images)

    images.forEach(file => {
      values.pictureUrls.push(`${file.name}`)
      values.files.push(file)
    })
  }

  return (
    <>
      <Form onSubmit={onSubmit} noValidate className={loading ? "loading" : ""}>
        <Form.Input
          label="Bikename"
          placeholder="Bikename.."
          name="bikename"
          type="text"
          value={values.bikename}
          error={errors?.bikename ? true : false}
          onChange={onChange}
        />
        <Form.Select
          fluid
          label="Category"
          name="category"
          multiple
          search
          options={categories}
          placeholder="Category"
          onChange={(e, { value }) => {
            values.category = value
            setCategory(value)
          }}
          value={category}
        />
        <Form.Select
          fluid
          label="Brand"
          search
          name="brand"
          options={brands}
          placeholder="Brand"
          onChange={(e, { value }) => {
            values.brand = value
            setBrand(value)
          }}
          value={brand}
        />
        <Form.TextArea label="description" placeholder="description.." name="description" type="text" onChange={onChange} value={values.description} />
        <Form.Checkbox
          label="Is Active"
          name="isActive"
          type="checkbox"
          checked={isActive}
          onChange={(key, value) => {
            values.isActive = value.checked
            setIsActive(value.checked)
          }}
          value={Number(values.isActive)}
        />
        <Form.Input label="storyUrl" placeholder="storyUrl.." name="storyUrl" type="text" onChange={onChange} value={values.storyUrl} />
        <Form.Input
          label="Production Start Year"
          placeholder="prodStartYear.."
          name="prodStartYear"
          type="number"
          onChange={onChange}
          value={values.prodStartYear}
        />
        <Form.Input label="Production End Year" placeholder="prodEndYear.." name="prodEndYear" type="number" onChange={onChange} value={values.prodEndYear} />
        <Form.Field>
          <CustomDropzone multipleUpload={false} acceptedFiles={"image/*"} onDrop={setThumbnail}>
            <div>
              {!image && bike?.thumbUrl && <Image spaced bordered size="medium" src={bike?.thumbUrl} />}
              {!image && !bike?.thumbUrl && (
                <div>
                  <img src="/assets/images/icons/gray/plus.svg" className="gray-color" alt="" width="16" height="16" />
                  <p>Browse or Drag & Drop Bike's Thumbnail</p>
                </div>
              )}
              {image && (
                <div style={{ width: 300 }}>
                  <DropzoneUploadDisplay imageUrl={image[0]} />
                </div>
              )}
            </div>
          </CustomDropzone>
        </Form.Field>
        <Form.Field>
          <CustomDropzone acceptedFiles={"image/*"} onDrop={setBikesPhotos}>
            <div>
              {!selectedBikesImages.length && !bike?.pictureUrls?.length && (
                <div>
                  <img src="/assets/images/icons/gray/plus.svg" className="gray-color" alt="" width="16" height="16" />
                  <p>Browse or Drag & Drop Bikes Photo [Max 10MB per image] </p>
                </div>
              )}
              {!!selectedBikesImages.length && (
                <Grid>
                  <Grid.Row columns={selectedBikesImages.length}>
                    {selectedBikesImages.map((selectedBikesImage, key) => (
                      <Grid.Column key={key}>
                        <DropzoneUploadDisplay imageUrl={selectedBikesImage} />
                      </Grid.Column>
                    ))}
                  </Grid.Row>
                </Grid>
              )}
              {!selectedBikesImages.length && bike && !!bike?.pictureUrls?.length && (
                <Grid>
                  <Grid.Row columns={bike?.pictureUrls?.length}>
                    {bike.pictureUrls.map((pictureUrl, key) => (
                      <Grid.Column key={key}>
                        <Image src={pictureUrl} />
                      </Grid.Column>
                    ))}
                  </Grid.Row>
                </Grid>
              )}
            </div>
          </CustomDropzone>
        </Form.Field>
        <Button type="submit" primary>
          Upload
        </Button>
      </Form>
      {Object.keys(errors).length > 0 && (
        <div className="ui error message">
          <ul className="list">
            {Object.values(errors).map(value => (
              <li key={value}>{value}</li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}

export default UploadBike
