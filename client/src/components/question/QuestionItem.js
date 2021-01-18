import React, { useContext, useState, useEffect } from "react"
import { AuthContext } from "../../context/auth"
import { Header, Card, Button, Modal } from "semantic-ui-react"
import { Link } from "react-router-dom"
import moment from "moment"
import ReactHtmlParser from "react-html-parser"

function QuestionItem ({ question }) {
  return (
    <>
        <Card  fluid className="post-view rider-list questions-list-blk">
          <Header as={Link} to={`/posts/${question.id}`}>
              <h2 className="quest-text">
                <span className="text-light">Q:</span> {question.title}
              </h2>
              <div className="post-body"> {ReactHtmlParser(question.previewBody)} <span className="text-red"> ...Read More</span></div>         
              </Header>
              {question.bikes.length > 0 && (
                <div className="bike-list">
                  <h4>
                    Bikes:
                  </h4>
                  {question.bikes.map((b, i) => {
                    return (
                      <div className="d-inline-block" key={"thumbnail_" + i}>
                        <Button basic>{b.bikename}</Button>
                      </div>
                    )
                  })}
                </div>
              )}
              {question.location.length > 0 && (
                <div className="location-list">
                  <h4>
                      Locations:
                  </h4>
                  {question.location.map((l, i) => {
                    return (
                      <div className="d-inline-block" key={"thumbnail_" + i}>
                        <Button basic>{l}</Button>
                      </div>
                    )
                  })}
                </div>
              )}
              <div className="post-details">
                <div className="d-flex justify-content-between">
                  <ul className="post-action">
                    <li>
                      {question.likeCount ? question.likeCount : 0} Likes
                    </li>
                    <li>
                      {question.saveCount ? question.saveCount : 0} Saves
                    </li>
                    <li>
                      {question.commentCount ? question.commentCount : 0} Answers
                    </li>
                  </ul>
                  <span className="post-time">
                    {moment(question.createdAt).fromNow(true)} ago
                  </span>
                </div>
              </div>  
        </Card>  
    </>
  )
}
export default QuestionItem