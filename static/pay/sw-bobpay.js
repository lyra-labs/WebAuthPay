// const IS_WEBAUTHN_ACTIVATED = false
const IS_WEBAUTHN_ACTIVATED = true

let payment_request_event = undefined;
let payment_request_resolver = undefined;

self.addEventListener('canmakepayment', function (e) {
  console.log("can make payment !");

  e.respondWith(true);
});

self.addEventListener('paymentrequest', function (e) {

  payment_request_event = e;

  payment_request_resolver = new PromiseResolver();
  e.respondWith(payment_request_resolver.promise);

  var url = "";

  if (IS_WEBAUTHN_ACTIVATED == true) {
    url = "https://webauthpay-demo.lyra-labs.fr/cc_auth";
  } else {
    url = "https://webauthpay-demo.lyra-labs.fr/pay/paymentcinematics/sms.html"
  }

  console.log(e.methodData);

  e.openWindow(url)
    .then(window_client => {

      if (window_client == null)
        payment_request_resolver.reject('Failed to open window');

      console.log(window_client);

      // if (!window_client.focused) {
      //   window_client.focus()
      //     .catch((error) => {
      //       console.log(error);
      //     })
      // }

    })
    .catch(function (err) {
      payment_request_resolver.reject(err);
    })
});

self.addEventListener('message', listener = function (e) {
  if (e.data == "payment_app_window_ready") {
    sendPaymentRequest();
    return;
  }

  if (e.data.methodName) {
    payment_request_resolver.resolve(e.data);
  } else {
    payment_request_resolver.reject(e.data);
  }
});

function sendPaymentRequest() {
  // Note that the returned window_client from openWindow is not used since
  // it might be changed by refreshing the opened page.
  // Refer to https://www.w3.org/TR/service-workers-1/#clients-getall
  let options = {
    includeUncontrolled: false,
    type: 'window'
  };
  clients.matchAll(options).then(function (clientList) {
    for (var i = 0; i < clientList.length; i++) {
      // Might do more communications or checks to make sure the message is
      // posted to the correct window only.

      // Copy the relevant data from the paymentrequestevent to
      // send to the payment app confirmation page.
      // Note that the entire PaymentRequestEvent can not be passed through
      // postMessage directly since it can not be cloned.
      clientList[i].postMessage({
        total: payment_request_event.total,
        methodData: payment_request_event.methodData,
      });
    }
  });
}

function PromiseResolver() {
  /** @private {function(T=): void} */
  this.resolve_;

  /** @private {function(*=): void} */
  this.reject_;

  /** @private {!Promise<T>} */
  this.promise_ = new Promise(function (resolve, reject) {
    this.resolve_ = resolve;
    this.reject_ = reject;
  }.bind(this));
}

PromiseResolver.prototype = {
  /** @return {!Promise<T>} */
  get promise() {
    return this.promise_;
  },

  /** @return {function(T=): void} */
  get resolve() {
    return this.resolve_;
  },

  /** @return {function(*=): void} */
  get reject() {
    return this.reject_;
  },
};
