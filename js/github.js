export function getStarCount() {
  return fetch('https://api.github.com/repos/lokesh/color-thief')
    .then(res => res.json())
    .then(data => {
      return data.stargazers_count;
    });
}
