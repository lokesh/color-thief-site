export function getStarCount(user, repo) {
  return fetch(`https://api.github.com/repos/${user}/${repo}`)
    .then(res => {
      if (res.ok) {
        return res.json()
      } else {
        throw new Error(res.statusText);
      }
    })
    .then(data => {
      return data.stargazers_count;
    })
}
