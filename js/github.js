export async function getStarCount(user, repo) {
  try {
    const res = await fetch(`https://api.github.com/repos/${user}/${repo}`);
      if (res.ok) {
        let data = await res.json()
        return data.stargazers_count;
      } else {
        return false;
      }
    } catch(err) {
      return false;
    }
}
