export const convertPostsToArray = posts => {
  let formattedPosts = [];
  if (posts && posts.length) {
    formattedPosts = Object.keys(posts).map(postID => {
      return { ...posts[postID], postID };
    });
  }
  return formattedPosts;
};

export const sortAsc = list => {
  return list.sort((a, b) => a - b);
};
