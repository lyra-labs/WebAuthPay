'use strict';

let getMakeCredentialsChallenge = (formBody) => {
    return fetch('/webauthn/register', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
        .then((response) => response.json())
        .then((response) => {
            if (response.status !== 'ok')
                throw new Error(`Server responed with error. The message is: ${response.message}`);

            return response
        })
}

let sendWebAuthnResponse = (body) => {
    return fetch('/webauthn/response', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then((response) => response.json())
        .then((response) => {
            console.log(response)
            if (response.status !== 'ok')
                throw new Error(`Server responed with error. The message is: ${response.message}`);

            return response
        })
}

//
// Username is credit card number and password is date (testing phase)
//

function authGraphicalUpdate() {

    var snack;

    $("[name='tuto-validation']").prop('disabled', true);

    snack = document.getElementById("snackbar-auth");
    snack.className = "show"
    setTimeout(function () { snack.className = snack.className.replace("show", ""); }, 5000)
}

//
// Create credentials and call the server to associate authenticator to cc-nb + date
//

$("[name='tuto-validation']").click(function (event) {
    event.preventDefault();

    let cc_number = window.payment_variables.cc_number_g
    let expDate = window.payment_variables.expDate_g
    let name = "testFakeHolder";

    authGraphicalUpdate()

    if (!cc_number || !name || !expDate) {
        console.log('Name , cc_number or expDate is missing!')
        return
    }

    getMakeCredentialsChallenge({ cc_number, name, expDate })
        .then((response) => {
            let publicKey = preformatMakeCredReq(response);
            return navigator.credentials.create({ publicKey })
        })
        .then((response) => {
            let makeCredResponse = publicKeyCredentialToJSON(response);
            console.log(makeCredResponse)
            makeCredResponse.isLoginAuthType = false;
            return sendWebAuthnResponse(makeCredResponse)
        })
        .then((response) => {
            if (response.status === 'ok') {
                console.log("success")
                window.location.replace("https://webauthpay-demo.lyra-labs.fr?auth=success")
            } else {
                console.log(`Server responed with error. The message is: ${response.message}`);
                window.location.replace("https://webauthpay-demo.lyra-labs.fr?auth=error")
            }
        })
        .catch((error) => {
            console.log(error)
            window.location.replace("https://webauthpay-demo.lyra-labs.fr?auth=error")
        })
})

let getGetAssertionChallenge = (formBody) => {
    console.log(formBody);
    return fetch('/webauthn/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(formBody)
    })
        .then((response) => response.json())
        .then((response) => {
            if (response.status !== 'ok') {
                if (response.message === "Not registered")
                    return response
                throw new Error(`Server responed with error. The message is: ${response.message}`);
            }

            return response
        })
}

//
//   Username is cc-number and password is exp date (testing)
//

function showPaymentTutorial() {
    $('#base-container').hide()
    $('#container-tuto').show()

    var snack;

    snack = document.getElementById("snackbar-auth");
    snack.className = "show"
    setTimeout(function () { snack.className = snack.className.replace("show", ""); }, 5000)
}

$('#payment-form').submit(function (event) {
    event.preventDefault();

    // let username = this.username.value;
    // let password = this.password.value;

    let cvv = this.cvv.value;
    let cc_number = this.number.value;
    let expDate = this.expDate.value;


    if (!cvv || !cc_number || !expDate) {
        console.log("Missing cc-number or cvv or expiration date");
    }

    getGetAssertionChallenge({ cc_number, expDate, cvv })
        .then((response) => {
            console.log(response)
            if (response.status === 'failed' && response.message === "Not registered") {
                showAlternativeStrongAuth()
                return {'status': 'done'} 
            }
            showPaymentTutorial()
            let publicKey = preformatGetAssertReq(response);
            return navigator.credentials.get({ publicKey })
        })
        .then((response) => {
            if (response.status === 'done') return {'status': 'done'} 

            // easiest solution found to make double factor auth and not 2 steps auth
            let getAssertionResponse = publicKeyCredentialToJSON(response);
            getAssertionResponse.usernameToTest = cc_number;
            getAssertionResponse.passwordToTest = expDate;
            getAssertionResponse.isLoginAuthType = true;
            return sendWebAuthnResponse(getAssertionResponse)
        })
        .then((response) => {
            if (response.status === 'done') return {'status': 'done'} 
            else if (response.status === 'ok') {
                console.log("success")
                showPaymentSuccess()
            } else {
                showPaymentError()
            }
        })
        .catch((error) => showPaymentError())
})

$('#card-form').submit(function (event) {
    event.preventDefault()

    let cc_number_g = this.number.value
    let expDate_g = this.expDate.value

    window.payment_variables = {
        cc_number_g: cc_number_g,
        expDate_g: expDate_g
    }

    $('#card-register-all').hide()
    $('#container-tuto').show()
    $('#footer_payment').hide()
})