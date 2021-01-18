import React from "react"
import { ApolloConsumer } from "@apollo/client"

const WithApolloClient = () => <ApolloConsumer>{client => "We have access to the client!" /* do stuff here */}</ApolloConsumer>
