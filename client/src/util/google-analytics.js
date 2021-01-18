import ReactGA from "react-ga"

ReactGA.initialize("UA-176935934-1", { testMode: true })

/**
 * Event - Add custom tracking event.
 *
 * Category - Login, Post, Bike
 * Action - logout, Post, Comment,
 * Label - Component, Page
 *
 */
export const GA_Event = (category, action, label) => {
  //  ReactGA.initialize("UA-176935934-1", { testMode: true })
  ReactGA.event({
    category: category,
    action: action,
    label: label
  })
}

export const GA_Track = path => {
  //Record GA
  //TODO: Need to move this NODE_ENV. Just that currently, it does not distnguish between stage and prod. We Know
  // we'll always have motomob as the bucket for production and that's what we're tracking
  //   debugger
  ReactGA.set({ page: path }) // Update the user's current page
  ReactGA.pageview(path) // Record a pageview for the given page
}
