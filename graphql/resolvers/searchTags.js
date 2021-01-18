module.exports = {
  // Query: {
  //   async searchPosts(_, { cursor, fieldmap, limit = FETCH_LIMIT }) {
  //     //If no cursor specified, it means it is for the first time; set the cursor to time now
  //     if (!cursor) {
  //       cursor = /*new ObjectID() */ new Date().toISOString()
  //     }
  //     //create dynamic query based on incoming field
  //     let qy = {}

  //     fieldmap.forEach(pair => {
  //       let pattern = pair.pattern

  //       //AND gate: (?=.*greece).*(?=.*dead). Here we're searching for greece AND dead in any order
  //       //OR gate: (?=.*greece)|(?=.*dead). Here we're searching for greece OR dead in any order
  //       let gate = pair.gate === "OR" ? "|" : ".*" //default is AND

  //       pattern.replace(/[\n\r\s\t]+/g, " ")
  //       pattern = "(?=.*" + pattern.split(" ").join(`)${gate}(?=.*`) + ")"
  //       qy[pair.field] = { $regex: pattern, $options: "i" }
  //     })
  //     console.log(qy)
  //     //fetch more more than needed
  //     const posts = await Post.find(qy)
  //       //       .sort({ _id: -1 })
  //       .limit(limit + 1) //Select one more record

  //     //pop the last one out
  //     const _post = posts.pop()

  //     if (posts.length < limit || !_post) {
  //       cursor = "" //set the cursor to "" in case there are no posts left
  //     } else {
  //       //set the cursor on the limit + 1'th record
  //       cursor = _post.id
  //     }

  //     return { posts, cursor }
  //   },
  Mutation: {}
}

//TODO: Remove all pubsub as it is going to be heavy if not used properly
