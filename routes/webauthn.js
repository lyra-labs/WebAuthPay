const express   = require('express');
const utils     = require('./utils');
const config    = require('../config.json');
const base64url = require('base64url');
const router    = express.Router();
const database  = require('./db');
const passwordHandler = require('./password');


// 
//          REGISTER
//

//
//  Note that during all process, the username is the cc-number, and the password is the date
//

router.post('/register', (request, response) => {
    if(!request.body || !request.body.cc_number || !request.body.name || !request.body.expDate) {
        response.json({
            'status': 'failed',
            'message': 'Request missing name or username field!'
        })

        return
    }

    let username = request.body.cc_number;
    let name     = request.body.name;
    let password = request.body.expDate;

    // if(database[username] && database[username].registered) {
    //     response.json({
    //         'status': 'failed',
    //         'message': `Username ${username} already exists`
    //     })

    //     return
    // }

    // Always return ok
    if (passwordHandler.handleBasicAuthRegister(username, password, name).status != 'ok') {
        response.json({
            'status': 'failed',
            'message': 'Auth failed'
        })
    }

    database[username] = {
        'name': name,
        'registered': false,
        'password': password,
        'id': utils.randomBase64URLBuffer(),
        'authenticators': []
    }

    let challengeMakeCred    = utils.generateServerMakeCredRequest(username, name, database[username].id)
    challengeMakeCred.status = 'ok'

    request.session.challenge = challengeMakeCred.challenge;
    request.session.username  = username;

    response.json(challengeMakeCred)
})

//
//      LOGIN
//

//
//  Note that during all process, the username is the cc-number, and the password is the date
//  Refactoring will happen later
//

router.post('/login', (request, response) => {
    if(!request.body || !request.body.cc_number || !request.body.cvv || !request.body.expDate) {
        response.json({
            'status': 'failed',
            'message': 'Request missing username or password field!'
        })

        return
    }

    let username = request.body.cc_number;
    let password = request.body.expDate;
    let cvv = request.body.cvv;


    if (!database[username]) {
        response.json({
            'status' : 'failed',
            'message' : 'Can\'t access the user\'s authenticator'
        })

        return 
    }

    database[username].cvv = cvv;

    let getAssertion    = utils.generateServerGetAssertion(database[username].authenticators)
    getAssertion.status = 'ok'

    request.session.challenge = getAssertion.challenge;
    request.session.username  = username;

    response.json(getAssertion)
})

//
//      RESPONSE
//

router.post('/response', (request, response) => {
    if(!request.body       || !request.body.id
    || !request.body.rawId || !request.body.response
    || !request.body.type  || request.body.type !== 'public-key' ) {
        response.json({
            'status': 'failed',
            'message': 'Response missing one or more of id/rawId/response/type fields, or type is not public-key!'
        })

        return
    }


    if (request.body.isLoginAuthType === true) {

        let password = request.body.passwordToTest;
        let username = request.body.usernameToTest;
        
        let loginTest = passwordHandler.handleBasicAuthLogin(username, password)
        if (loginTest.status !== 'ok') {
            response.json(loginTest)
            return
        }
    }

    let webauthnResp = request.body
    let clientData   = JSON.parse(base64url.decode(webauthnResp.response.clientDataJSON));

    /* Check challenge... */
    if(clientData.challenge !== request.session.challenge) {
        response.json({
            'status': 'failed',
            'message': 'Authentication error 1'
        })

        return
    }

    /* ...and origin */

    if(clientData.origin !== config.origin && clientData.origin !== "http://localhost:8080") {
        response.json({
            'status': 'failed',
            'message': `Authentication error 2 : ${clientData.origin} | ${config.origin}`
        })
        return 
    }

    let result;
    if(webauthnResp.response.attestationObject !== undefined) {
        /* This is create cred */
        result = utils.verifyAuthenticatorAttestationResponse(webauthnResp);

        if(result.verified) {
            database[request.session.username].authenticators.push(result.authrInfo);
            database[request.session.username].registered = true
        }
    } else if(webauthnResp.response.authenticatorData !== undefined) {
        /* This is get assertion */
        result = utils.verifyAuthenticatorAssertionResponse(webauthnResp, database[request.session.username].authenticators);
    } else {
        response.json({
            'status': 'failed',
            'message': 'Can not determine type of response!'
        })
    }

    if(result.verified) {
        request.session.loggedIn = true;
        response.json({ 'status': 'ok' })
    } else {
        response.json({
            'status': 'failed',
            'message': 'Can not authenticate signature!'
        })
    }
})

module.exports = router;
