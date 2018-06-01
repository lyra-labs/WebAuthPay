const database = require('./db');

let handleBasicAuthRegister = (username, password, name) => {
    return {
        'status': 'ok'
    }
}

let handleBasicAuthLogin = (username, password) => {

    if (!username || !password) {
        return {
            'status': 'failed',
            'message': 'Request missing username or password!'
        };

        return
    }

    if (!database[username] || !database[username].registered || database[username].password !== password) {
        return {
            'status': 'failed',
            'message': `Authentication error 0`
        }
    }

    return {
        'status': 'ok'
    }
}

module.exports = {
    handleBasicAuthLogin,
    handleBasicAuthRegister
}
