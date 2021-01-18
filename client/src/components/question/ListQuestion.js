import React from "react"
import QuestionItem from "./QuestionItem"

export const ListQuestions = ({ questions }) => {
  return !!questions.length ? questions.map((question, i) => <QuestionItem question={question} key={i} />) : <p>....still waiting for your first question!</p>
}
