import React, { useState, useContext,useEffect } from "react"
import UploadPhoto from "../../components/contest/UploadPhoto"
import { useForm } from "../../util/hooks"
import { Input, Form, Button ,TextArea, Table, Checkbox,Icon,Modal,Image,Dimmer,Loader } from "semantic-ui-react"

import "react-semantic-ui-datepickers/dist/react-semantic-ui-datepickers.css"
import { useMutation } from "@apollo/client"
import { AuthContext } from "../../context/auth"
import  Adminbar  from "../../components/menu/Adminbar"

import { CREATE_SPONSOR_MUTATION,FETCH_ALL_SPONSOR_QUERY,TOGGLEACTIVE_SPONSOR_MUTATION} from "../../common/gql_api_def"
import { validateSponsor } from "../../util/validators"
import { useQuery } from "@apollo/client"

function Sponser() {
  const { user } = useContext(AuthContext)
  const isAdmin = user && user.admin
  let [editDisplayImg, setEditDisplayImg] = useState("")
  let [image, setImage] = useState("")
  let [deleteId, setDeleteId] = useState("")
  let [isView, setIsView] = useState(false)
  let [tempData, setTempData] = useState({})
  const [errors, setErrors] = useState({})
  const [sponsorsList, setSponsorsList] = useState([]);
  const [open, setOpen] = useState(false)
  const [openModal, setOpenModal] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { loading, data, error } = useQuery(FETCH_ALL_SPONSOR_QUERY, {
  })
  console.log('loading',loading)
  useEffect(() => {
    if (data && data.getAllSponsors) {
      setSponsorsList(data.getAllSponsors)
    }
  }, [data])

  useEffect(() => {
    if (image) {
      values.imageUrl = image[0].name
    }
  }, [image])

  let { onChange, onSubmit, values } = useForm(uploadCallback, {
    id:"",
    name: "",
    description: "",
    imageUrl:"",
    isActive:true
  })
  
  async function uploadCallback() {
    const { valid, errors } = validateSponsor(values.name, values.description, values.imageUrl)
    if (!valid) {
      setErrors(errors)
    } else {
      var files = image;
      if(files){
        let base_strings = files.map(file => {
          return toBase64(file);
        });

        const myImages = await Promise.all(base_strings);
        if(myImages.length > 0){
          values.imageUrl = myImages[0]
        }
      }
      setIsLoading(true)
      CreateSponsor()
    }
  }

  const toBase64 = file => new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });

  const [CreateSponsor] = useMutation(CREATE_SPONSOR_MUTATION, {
    update(store, { data }) {
      if(values.id == ""){
        const dataList = store.readQuery({ query: FETCH_ALL_SPONSOR_QUERY, variables: {} })
        store.writeQuery({
          query: FETCH_ALL_SPONSOR_QUERY,
          data: {
            getAllSponsors: [data.createSponsor, ...dataList.getAllSponsors]
          }
        })
      }
      setOpen(false)
      setIsLoading(false)
      resetValues()
    },
    onError(err) {
      console.log(err)
      setErrors(err.graphQLErrors[0].extensions.exception.errors)
    },
    variables: values
  })

  const editSponsor = (value) => {
    values.name = value.name
    values.description = value.description
    values.isActive = value.isActive
    values.id = value.id
    values.imageUrl = value.imageUrl
    setEditDisplayImg(value.imageUrl)
    setOpen(true)
  }

  const resetValues = () => {
    values.name = ""
    values.description = ""
    values.isActive = true
    values.id = ""
    values.imageUrl = ""
    setImage("")
    setErrors({})
  }

  const [activeDeactiveSponsor] = useMutation(TOGGLEACTIVE_SPONSOR_MUTATION, {
    update(store, { data }) {
      setSponsorsList(data.activeDeactiveSponsor)
      setOpenModal(false)
      setDeleteId("")
      resetValues()
    },
    variables: {
      id:deleteId
    },
    onError(err) {
      setOpenModal(false)
      setErrors(err.graphQLErrors[0].extensions.exception.errors)
      setTimeout(function() {
        setErrors({})
      },4000);
    },
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
    activeDeactiveSponsor()
  }
  const textSubStr = (str,length) => {
    let purpose = str.substring(0, length)
    if (str.length > length) {
        purpose = purpose + "...";
    }
    return (<>{purpose}</>)
  }

  return (
      
    <div className="create-contest-container" >
     
        <Adminbar />
      {!isAdmin ? (
        <h4>Tsk tsk! You're not allowed here....</h4>
      ) : (
          <>
               <h1> Sponsor </h1>
               <div style={{ marginTop : "-40px"}}>
               <Button
                floated='right'
                icon
                labelPosition='left'
                primary
                size='small'
                onClick={e => {setOpen(true)}} 
              >
                
                <Icon name='user' /> Add Sponser
              </Button>
               </div>
        <Modal size="small" closeIcon open={open} onClose={() => {setOpen(false);setEditDisplayImg("");setIsView(false);resetValues();setImage("");setErrors({})}} onOpen={() => setOpen(true)}>
            <Modal.Content scrolling>
              <Form onSubmit={onSubmit} noValidate className={(isLoading ? "loading " : " ")}>
                {!isView && <h1>{values.id?"Update sponsor":"Add sponsor"}</h1>}
                {isView && <h1>{"View sponsor"}</h1>}
                <Form.Field>
                  <label>Sponsor name:</label>
                  <Input disabled={isView} className={errors && errors.name ? "error" : ""}  placeholder="Sponsor name" name="name" type="text" value={values.name} onChange={onChange} />
                  {errors && errors.name && (
                    <span className="error-message">{errors.name}</span>
                  )}
                </Form.Field>
                <Form.Field>
                  <label>Description:</label>
                  <TextArea disabled={isView} className={errors && errors.description ? "error" : ""}  placeholder="Sponsor description" name="description" type="text" value={values.description} onChange={onChange} />
                  {errors && errors.description && (
                    <span className="error-message">{errors.description}</span>
                  )}
                </Form.Field>
                {values.id && editDisplayImg !="" &&  <><Image src={editDisplayImg} height="100" width="100" /> <br/></>}
                {!isView && <Form.Field>
                  <label>Thumbnail image:</label>
                  <UploadPhoto values={values} setImage={setImage} image={image} />
                  {errors && errors.imageUrl && (
                    <span className="error-message">{errors.imageUrl}</span>
                  )}
                </Form.Field>}
                {!isView && <Button type="submit" primary>
                  {values.id?"Update":"Save"}
                </Button>}
              </Form>
            </Modal.Content>
        </Modal>
        {loading ? (
        <Dimmer active>
          <Loader />
        </Dimmer>
      ) : (
        <>
        <Table compact celled definition>
        <Table.Header>
          <Table.Row>
          <Table.HeaderCell /> 
            <Table.HeaderCell>Name</Table.HeaderCell>
            <Table.HeaderCell>Description</Table.HeaderCell>
            <Table.HeaderCell>Logo</Table.HeaderCell>
            <Table.HeaderCell>Status</Table.HeaderCell>
            <Table.HeaderCell>Actions</Table.HeaderCell>
         
         
          </Table.Row>
        </Table.Header>
    
        <Table.Body>
          {sponsorsList && sponsorsList.length > 0 &&
            sponsorsList.map((value,key) => {
                return (
                    <Table.Row key={key}>
                      <Table.Cell collapsing>
                        <Checkbox slider checked={value.isActive} onChange={()=>openConfirm(value)} />
                      </Table.Cell>
                      <Table.Cell>{textSubStr(value.name,10)}</Table.Cell>
                      <Table.Cell>{textSubStr(value.description,25)}</Table.Cell>
                      <Table.Cell>
                        <Image src={value.imageUrl} height="50" width="50" />
                      </Table.Cell>
                      <Table.Cell>
                        <span>{value.isActive?"Active":"Deactive"}</span>
                      </Table.Cell>
                      <Table.Cell>
                       <Button basic color="green" onClick={()=>{editSponsor(value);setIsView(true)}}>View</Button>
                       <Button basic color="green" onClick={()=>editSponsor(value)}>Edit</Button>
                      </Table.Cell>
                    </Table.Row>
                )
            })
          }
        </Table.Body>
      </Table>
        </>
      )}
        
      {errors?.exist_in_contest && <><span className="ui error message">{errors.exist_in_contest}</span></>}
      <Modal size="small" closeIcon open={openModal} onClose={() => closeConfirmModal()} onOpen={() => setOpenModal(true)}>
        <Modal.Header>{tempData.isActive?"Deactive":"Active"} Sponsor !</Modal.Header>
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

export default Sponser