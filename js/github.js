export function getStarCount() {
  return fetch('https://api.github.com/repos/lokesh/color-thief')
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
