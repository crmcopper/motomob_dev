import React from "react"
import App from "./App"
import { ApolloLink } from "apollo-link"
import fetch from "node-fetch"
import { ApolloClient, ApolloProvider, createHttpLink, InMemoryCache } from "@apollo/client"
// import { onError } from "apollo-link-error";
import { setContext } from "apollo-link-context"
import { getAccessToken } from "./context/auth"
import { GA_Track } from "./util/google-analytics"

const httpLink = createHttpLink({
  uri: process.env.REACT_APP_SERVER_URL,
  fetch: fetch
})

// const ErrorLink = onError(({ graphQLErrors, networkError, operation, forward, response }) => {
//   if (graphQLErrors) {
//     console.log(graphQLErrors[0].message)

//     if(graphQLErrors[0].message==='Invalid/Expired token') {
//       alert("Refresh your page....")
//     }
//   }

//   if (networkError) {alert(`[Network error]: ${networkError}`); console.log(`[Network error]: ${networkError}`)}
// });

const authLink = setContext(() => {
  GA_Track(window.location.href)

  const token = getAccessToken()
  return {
    headers: {
      Authorization: token ? `Bearer ${token}` : ""
    }
  }
})

//Provide all references of objects that are already in the cache and dont need to be fetched again
const cacheInMemory = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        getPost(_, { args, toReference }) {
          return toReference({
            __typename: "Post",
            id: args.postId
          })
        }
      }
    }
  }
})

//TODO: Think caching (ApolloClient InMemoryVars, or Memcache?)
export const client = new ApolloClient({
  link: ApolloLink.from([authLink, httpLink]),
  // cache: new InMemoryCache()
  cache: cacheInMemory
})

export default (
  <ApolloProvider client={client}>
    <App />
  </ApolloProvider>
)
