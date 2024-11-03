export const VALID_USERNAMES = ["mateusvrs", "iagorrr", "bitterteriyaki", "tourist", "benq", "caio-felipee"]

export const GitHubAPI = (url, options) => {
    const parts = url.split('/')
    const username = parts[parts.length - 1]

    const valid = VALID_USERNAMES.find((element) => element === username)
    if (!valid) {
        return Promise.resolve({
            status: 404
        })
    }

    const body = {
        name: username == "iagorrr" ? null : "User Name",
        login: username,
        avatar_url: "https://avatars.githubusercontent.com/u/85769349?v=4"
    }

    return Promise.resolve({
        json: () => Promise.resolve(body),
        status: 200
    })
}