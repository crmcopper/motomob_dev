import React, { useState, useContext,useEffect} from "react"
import UploadPhoto from "../../components/contest/UploadPhoto"
import { useForm } from "../../util/hooks"
import { Input, Form, Button, Table, Checkbox,Icon,Modal,Image,Dimmer,Loader } from "semantic-ui-react"
import RichTextEditor from "../../components/util/RichTextEditor"
import { CREATE_CONTEST_MUTATION,FETCH_ALL_SPONSOR_QUERY,S3_SIGN_MUTATION,FETCH_CONTESTS_QUERY,TOGGLEACTIVE_CONTEST_MUTATION } from "../../common/gql_api_def"
import SemanticDatepicker from "react-semantic-ui-datepickers"
import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css"
import { useMutation } from "@apollo/client"
import { AuthContext } from "../../context/auth"
import  Adminbar  from "../../components/menu/Adminbar"
import { useQuery } from "@apollo/client"
//import { uploadToS3 } from "../../util/helpers"
import { validateContest } from "../../util/validators"
import { S3Folders } from "../../util/Constants"
import { formatFilename, uploadToS3 } from "../../util/s3"
import ReactHtmlParser from "react-html-parser"
import moment from "moment"
function CreateContest() {
  const files = []
  const { user } = useContext(AuthContext)
  const [sponsorsListTempArray, setsponsorsListTempArray] = useState(false)
  const isAdmin = user && user.admin
  const [sponsorsList, setSponsorsList] = useState([]);
  const [sponsorTemp, setSponsorTemp] = useState([]);
  const [saveLoading, setsaveLoading] = useState(false)
  const [imageUploadError, setimageUploadError] = useState(false)
  const [tableListingData, setTableListingData] = useState([])
  const [isListing, setIslisting] = useState(true)

  const [errors, setErrors] = useState({})
  const [sponsorsArray, setSponsors] = useState([])
  const [image, setImage] = useState("")
  const [endDate, setEndDate] = useState(null)
  let [deleteId, setDeleteId] = useState("")

  let [editDisplayImg, setEditDisplayImg] = useState("")
  let [isView, setIsView] = useState(false)
  let [tempData, setTempData] = useState({})
  const [openModal, setOpenModal] = useState(false)
  const { loading, data, error } = useQuery(FETCH_ALL_SPONSOR_QUERY, {
    variables:{isActive:true},
    fetchPolicy: 'no-cache'
  })

  const { loadingContest, dataContest, errorContest } = useQuery(FETCH_CONTESTS_QUERY, {
    onCompleted: data => {
      if (data.getContests) {
        setTableListingData(data.getContests)
      }
    }
  })


  useEffect(() => {
    if (data && data.getAllSponsors) {
      var tempList = []
      setsponsorsListTempArray(data.getAllSponsors)
      data.getAllSponsors.map((value,key) => {
        var obj = {
          key:value.id,
          value:value.id,
          text:value.name,
          image:value.imageUrl,
        }
        tempList.push(obj)
      })
      
      setSponsorsList(tempList)
    }
  }, [data])

  let { onChange, onSubmit, values } = useForm(uploadCallback, {
    id:"",
    title: "",
    sponsors: [],
    imageUrl: "",
    closingDate: "",
    sponsor_description:"",
    prize_description:"",
    criteria_description:"",
    isActive:true,
    photos:[],
  })
  useEffect(() => {
    if (image) {
      values.imageUrl = image[0].name
    }
  }, [image])

  async function uploadCallback() {
    const { valid, errors } = validateContest(values.title,values.imageUrl,values.sponsors,values.closingDate,values.sponsor_description,values.prize_description,values.criteria_description)
    if (!valid) {
      setErrors(errors)
    }else{
      if (image) {
        files.push({ name: `${S3Folders.contests}/${formatFilename(image[0].name)}`, type: image[0].type })
      }

      if(values && values.id){
        if (!!files.length) {
          s3Sign()
        } else {
          values.sponsors = sponsorTemp
          createContest()
        }
      } else {
        if (!!files.length) {
          s3Sign()
        }
      }
    }
  }

  const [s3Sign] = useMutation(S3_SIGN_MUTATION, {
    update(store, { data: { s3Sign } }) {
      uploadFilesToS3(image, s3Sign)
    },
    onError(err) {
      console.log(err)
    },
    variables: { files: files }
  })

  /* upload files to s3 */
  async function uploadFilesToS3(image,s3Sign) {
    setsaveLoading(true)
    uploadToS3(image, s3Sign).then(function(response){
      let deletedFiles = []
      if(response){
        if(response.length){
          response.map((failedFile)=>{            
            deletedFiles.push(failedFile.filename)
          })
        }
      }
      if(!deletedFiles.length){
        setimageUploadError(false)
        values.imageUrl = s3Sign[0].url
        values.sponsors = sponsorTemp
        createContest()
      } else {
        setimageUploadError(true)
        setsaveLoading(false)
      }
    })
  }

  const [createContest] = useMutation(CREATE_CONTEST_MUTATION, {
    update(store, { data }) {
      resetValues()
      setTableListingData(data.createContest)
    },
    onError(err) {
      console.log(err)
      resetValues()
    },
    variables: values
  })

  const resetValues = () => {
    values.id = ""
    values.title = ""
    values.sponsors = []
    values.imageUrl = ""
    values.closingDate = ""
    values.sponsor_description = ""
    values.prize_description = ""
    values.criteria_description = ""
    values.isActive = true
    values.photos = []
    setImage("")
    setErrors({})
    setimageUploadError(false)
    setsaveLoading(false)
    setIslisting(true)
    setOpenModal(false)
    setIsView(false)
    setSponsorTemp([])
    setSponsors([])
    setDeleteId("")
  }
  const editContest = (value) => {
    var editSponsor = []
    var testData = []
    value.sponsors.map((val,k)=>{
      editSponsor.push(val.id)
      var obj = {
        id:val.id,
        name:val.name,
        imageUrl:val.imageUrl,
      }
      testData.push(obj)
    })
    setSponsors(editSponsor)
    values.sponsors = testData
    setSponsorTemp(testData)
    values.id = value.id
    values.title = value.title
    values.closingDate = new Date(value.closingDate)
    values.imageUrl = value.imageUrl
    values.sponsor_description = value.sponsor_description
    values.prize_description = value.prize_description
    values.criteria_description = value.criteria_description
    values.isActive = value.isActive
    values.photos = []
    setEditDisplayImg(value.imageUrl)
    setIslisting(false)
  }

  const textSubStr = (str,length) => {
    let purpose = str.substring(0, length)
    if (str.length > length) {
        purpose = purpose + "...";
    }
    return (<>{purpose}</>)
  }
  
  const [activeDeactiveContest] = useMutation(TOGGLEACTIVE_CONTEST_MUTATION, {
    update(store, { data }) {
      setTableListingData(data.activeDeactiveContest)
      setDeleteId("")
      resetValues()
    },
    variables: {
      id:deleteId
    }
  })
  const openConfirm = (value) => {
    setDeleteId(value.id)
    setTempData(value)
    setOpenModal(true)
  }

  const closeConfirmModal = () => {
    setOpenModal(false)
    setDeleteId("")
  }
  const confirmSponsor = () => {
    activeDeactiveContest()
  }  
  return (
    <div className="create-contest-container">
    
         <Adminbar />
      {!isAdmin ? (
        <h4>Tsk tsk! You're not allowed here....</h4>
      ) : (
        <>
        <h1> Contest </h1>
        {!isListing && 
          <Form onSubmit={onSubmit} noValidate className={(saveLoading ? "loading " : " ")}>
            {imageUploadError && (
              <div className="ui error message" style={{ display: "block" }}>
                <ul className="list">
                    <li>Problem while upload image, please try again</li>
                </ul>
              </div>
            )}
            {!isView && <h1>{values.id?"Update competition":"Add competition"}</h1>}
            {isView && <h1>{"View competition"}</h1>}
            <Form.Field>
              <label>Competition name:</label>
              <Input disabled={isView} placeholder="Competition name..." name="title" type="text" value={values.title} onChange={onChange} />
              {errors?.title && (
                <span className="error-message">{errors.title}</span>
              )}
            </Form.Field>
            <Form.Field>
              <label>End Date:</label>
              <div className="date-field">
                <SemanticDatepicker
                  disabled={isView}
                  onChange={(e, data) => {
                    setEndDate(data.value)
                    values.closingDate = data.value
                  }}
                  placeholder="YYYY-MM-DD"
                  format="YYYY-MM-DD"
                  clearIcon={false}
                  value={values.closingDate}
                  icon={
                    <span className="svg-icon">
                      <img src="/assets/images/icons/gray/calender.svg" className="gray-color" alt="Calender" width="16" height="16" />
                      {/* <img src="/assets/images/icons/calender.svg" className="red-color" alt="Calender" width="16" height="16" /> */}
                    </span>
                  }
                />
              </div>
              {errors?.closingDate && (
                <span className="error-message">{errors.closingDate}</span>
              )}
            </Form.Field>
            <Form.Select
              disabled={isView}
              fluid
              label="Sponsors"
              multiple
              search
              name="sponsors"
              options={sponsorsList}
              placeholder="Sponsors"
              onChange={(e, { value }) => {
                let dataArray= []
                values.sponsors = value
                value.map((val,k)=>{
                var data = sponsorsListTempArray.find(x => x.id === val);
                  if(data){
                    var obj = {
                      id:data.id,
                      name:data.name,
                      imageUrl:data.imageUrl,
                    }
                    dataArray.push(obj)
                  }
                })
                setSponsorTemp(dataArray)
                setSponsors(value)
              }}
              value={sponsorsArray}
            />
            {errors?.sponsors && (
              <span className="error-message">{errors.sponsors}</span>
            )}
            <Form.Field className={errors && errors.sponsor_description ? "error" : ""}>
              <label>Sponsor Description:</label>
              <RichTextEditor
                readOnly={isView}
                placeholder="Write your sponsor description here."
                onBodyChange={bodyOfEditor => (values.sponsor_description = bodyOfEditor)}
                value={values.sponsor_description}
                error={errors?.sponsor_description ? true : false}
              />
              {errors?.sponsor_description && (
                <span className="error-message">{errors.sponsor_description}</span>
              )}
            </Form.Field>
            <Form.Field className={errors && errors.prize_description ? "error" : ""}>
             <label>Prize Description:</label>
              <RichTextEditor
                readOnly={isView}
                placeholder="Write your prize description here."
                onBodyChange={bodyOfEditor => (values.prize_description = bodyOfEditor)}
                value={values.prize_description}
                error={errors?.prize_description ? true : false}
              />
              {errors?.prize_description && (
                <span className="error-message">{errors.prize_description}</span>
              )}
            </Form.Field>
            <Form.Field className={errors && errors.criteria_description ? "error" : ""}>
             <label>Criteria Description:</label>
              <RichTextEditor
                readOnly={isView}
                placeholder="Write your criteria description here."
                onBodyChange={bodyOfEditor => (values.criteria_description = bodyOfEditor)}
                value={values.criteria_description}
                error={errors?.criteria_description ? true : false}
              />
              {errors?.criteria_description && (
                <span className="error-message">{errors.criteria_description}</span>
              )}
            </Form.Field>
            {values.id && editDisplayImg !="" &&  <><Image src={editDisplayImg} height="100" width="100" /> <br/></>}
            {!isView && <Form.Field>
              <UploadPhoto values={values} setImage={setImage} image={image} />
              {errors?.imageUrl && (
                <span className="error-message">{errors.imageUrl}</span>
              )}
              </Form.Field>
            }
            {!isView && <Button type="submit" primary>
              {values.id?"Update":"Save"}
            </Button>}
            <Button primary onClick={()=>resetValues()}>
              {"Back"}
            </Button>
          </Form>
        }
        {loading ? (
        <Dimmer active>
          <Loader />
        </Dimmer>
      ) : 
        
          (isListing && (<> <Table compact celled definition>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell /> 
                <Table.HeaderCell>Comeption Name</Table.HeaderCell>
                <Table.HeaderCell>Sponsor</Table.HeaderCell>
                <Table.HeaderCell>End Date</Table.HeaderCell>
                <Table.HeaderCell>Cover Image</Table.HeaderCell>
                <Table.HeaderCell>Status</Table.HeaderCell>
                <Table.HeaderCell>Actions</Table.HeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {tableListingData && tableListingData.length > 0 &&
                tableListingData.map((value,key) => {
                    let dataArray = []
                    var closeDt = ""
                    if(value.closingDate){
                      var closeDt = moment(value.closingDate).format("YYYY-MM-DD")
                    }
                    value.sponsors.map((v,key) => {
                      if(v.id && v.id != null){
                        dataArray.push(v.name)
                      }
                    })
                    return (
                        <Table.Row key={key}>
                          <Table.Cell collapsing>
                            <Checkbox slider checked={value.isActive} onChange={()=>openConfirm(value)} />
                          </Table.Cell>
                          <Table.Cell>{value.title?value.title:"-"}</Table.Cell>
                          <Table.Cell>
                              {dataArray.length > 0?dataArray.join():"-"} 
                          </Table.Cell>
                          <Table.Cell>{closeDt?closeDt:"-"}</Table.Cell>
                          <Table.Cell>
                            <Image src={value.imageUrl} height="50" width="50" />
                          </Table.Cell>
                          <Table.Cell>
                            <span>{value.isActive?"Active":"Deactive"}</span>
                          </Table.Cell>
                          <Table.Cell>
                           <Button basic color="green" onClick={()=>{editContest(value);setIsView(true)}}>View</Button>
                           <Button basic color="green" onClick={()=>editContest(value)}>Edit</Button>
                          </Table.Cell>
                        </Table.Row>
                    )
                })
              }
            </Table.Body>
            <Table.Footer fullWidth>
              <Table.Row>
                <Table.HeaderCell />
                <Table.HeaderCell />
                <Table.HeaderCell />
                <Table.HeaderCell colSpan='5'>
                  <Button
                    floated='right'
                    icon
                    labelPosition='left'
                    primary
                    size='small'
                    onClick={e => {setIslisting(false)}} 
                  ><Icon name='user' /> Add Competition
                  </Button>
                </Table.HeaderCell>
              </Table.Row>
            </Table.Footer>
          </Table></>))
          
                  
        }
        <Modal size="small" closeIcon open={openModal} onClose={() => closeConfirmModal()} onOpen={() => setOpenModal(true)}>
        <Modal.Header>{tempData.isActive?"Deactive":"Active"} Contest !</Modal.Header>
        <Modal.Content scrolling>
          <p>Are you sure you want to {tempData.isActive?"Deactive":"Active"} ?</p>
        </Modal.Content>
        <Modal.Actions>
            <Button onClick={() => closeConfirmModal()} negative>No</Button> 
            <Button positive onClick={() => confirmSponsor()}>Yes</Button>
          </Modal.Actions>
      </Modal>
        </>
        
      )}
    </div>
  )
}

export default CreateContest