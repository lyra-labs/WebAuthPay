//disable automation concerning the auth Iframe
$.featherlight.autoBind = false

// Iframe param object
let defaults = {
    namespace: "featherlight",
    targetAttr: "data-featherlight",
    variant: null,
    resetCss: false,
    background: null,
    openTrigger: "click",
    closeTrigger: "click",
    filter: null,
    root: "body",
    openSpeed: 250,
    closeSpeed: 250,
    closeOnClick: "background",
    closeOnEsc: true,
    closeIcon: "&#10005;",
    loading: "",
    persist: false,
    otherClose: null,
    beforeOpen: $.noop,
    beforeContent: $.noop,
    beforeClose: $.noop,
    afterOpen: $.noop,
    afterContent: $.noop,
    afterClose: $.noop,
    onKeyUp: $.noop,
    onResize: $.noop,
    type: null,
    contentFilters: ["jquery", "image", "html", "ajax", "text"],
    "jquery/image/html / ajax / text": undefined,
}

// CReq content hardcoded
let CReq = {
    "threeDSServerTransID": "8a880dc0-d2d2-4067-bcb1-b08d1690b26e",
    "acsTransID": "d7c1ee99-9478-44a6-b1f2-391e29c6b340",
    "messageType": "CReq",
    "messageVersion": "2.1.0",
    "sdkTransID": "b2385523-a66c-4907-ac3c-91848e8c0067",
    "sdkCounterStoA": "001"
}

// will be used to close the auth Iframe later
let savedIframe = {}

// send the CReq and spawn the auth Iframe containing the plaintext HTML response
let sendcReq = (acsURL, acsTransID, threeDSServerTransID) => {

    CReq.acsTransID = acsTransID
    CReq.threeDSServerTransID = threeDSServerTransID

    fetch(acsURL, {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(CReq)
    })
        .then((response) => response.text())
        .then((response) => {

            console.log(response);

            savedIframe = $.featherlight(response, defaults)

        })
        .catch((error) => alert(error))
}

// send the form to the merchant server to initiate the transaction
let startAuthentication = () => {
    let paymentData = {
        cc_number: $('#cc-number-input').val(),
        email: $('#email-input').val(),
        cvv: $('#cvv-input').val(),
        cc_date: $('#date-input').val(),
        price: '90',
        name: $('#name-input').val(),
        postcode: $('#post-code-input').val(),
        city_name: $('#city-input').val(),
        phone_number: $('#tel-input').val(),
        address: $('#address-input').val()
    }

    // assert that all inputs are filled
    $.each(paymentData, (i, value) => {
        if (!value) { return false }
    })

    fetch('http://localhost:4242/merchant/pay', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(paymentData)
    })
        .then((response) => response.json())
        .then((response) => {
            console.log(response);
            if (response.data.messageType == 'ARes' && response.what == 'Challenge') {
                sendcReq(response.data.acsURL, response.data.acsTransID, response.data.threeDSServerTransID)
            } else {
                if (response.data.messageType === 'ARes') { alert('TODO'); return }
                alert('ERROR')
            }
        })
}

// here we get the URL + 3dsServerTransID
// We spawn the iframe (get ID, request wait response and message)
// in the message handler we send the startPayment request


$(document).ready(() => {

    let getIframeContent = (threeDSServerTransID) => {
        return fetch('http://localhost:4242/acs/getMethodHTML', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ "threeDSServerTransID": threeDSServerTransID })
        })
            .then((response) => response.text())
            .then((response) => response)
    }

    let getThreeDSMethod_URL = () => {
        return fetch('http://localhost:4242/merchant/init', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ cc_number: $('#cc-number-input').val() })
        })
            .then((response) => response.json())
            .then((response) => response)
    }

    // make the request with the CC number to the merchant to get the ACS url of 3ds method
    $('#button-iframe').click(() => {
        getThreeDSMethod_URL()
            .then((response) => {
                if (response.status !== 'ok') {
                    alert('Server error, your card may not be enrolled to 3DS2')
                    return
                } else {
                    getIframeContent(response.threeDSServerTransID)
                        .then((htmlContent) => {
                            document.getElementById('methodIframe').contentDocument.write(htmlContent)
                        })
                }
            })
    })
});

// Recieve message from Auth Iframe and 3DSMethod_URL Iframe

window.addEventListener("message", receiveMessage, false);

function receiveMessage(event) {

    let NOTIFICATION_URL = ""

    if (event.origin !== "http://localhost:9094") {
        return;
    }

    if (event.data) {

        NOTIFICATION_URL = event.data.notificationURL

        fetch(NOTIFICATION_URL, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(event.data)
        })
            .then((response) => response.json())
            .then((response) => {
                console.log(response);
                window.setTimeout(function () { savedIframe.close(); }, 2400);

            })
            .catch((error) => console.log(error))
    }


}
