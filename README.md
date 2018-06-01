# This is a work in progress, do not use

# WebAuthPay

Demonstrator with Webauthn + Payment request + Payment handler

## Requirement

The website should be tested with chrome canary with "Service Worker payment apps" and "Web Authentication API" flags enabled.

## Test it

Just `npm install` from the project root.
After the npm install has succeed, just run `node app`, the website should run on localhost:8080
Currently online [here](https://test-payment-handler.appspot.com/).

### How to test

To test it, you have to install the Payment handler at the bottom of the page.

After that, click the button Lauch Payment Request next to the phone.

If the installed payment handler does not appear, uninstall and reinstall it.

If it appears, select it and click the paiment button, it will probably fail the first time, just reclick on Launch Payment Request button and retry.

A login page will appear. It does not works at this time.

This project uses as basis:

     https://github.com/fido-alliance/webauthn-demo for the webauthn part.
     https://github.com/madmath/payment-request-show/tree/master/bobpay for the payment handler part.
     https://github.com/rsolomakhin/rsolomakhin.github.io/tree/master/pr/apps/basic-card for the payment request part.
