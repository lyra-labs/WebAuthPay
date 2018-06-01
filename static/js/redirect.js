let checkIfLoggedIn = () => {
    return fetch('/isLoggedIn', { credentials: 'include' })
        .then((response) => response.json())
        .then((response) => {
            if (response.status === 'ok') {
                return true
            } else {
                return false
            }
        })
}