/*
* On Document Ready
*/

function onAlternativeAuth() {
	if ($('#cc-sms').val() && $('#cc-sms').val().length > 0) {
		showPaymentSuccess()
	}
}

function showAlternativeStrongAuth() {
	$('#header_payment').hide()

	$('#card-register-main').hide()
	$('#container-sms').show()


	$('#footer_payment').hide()

	$('#container-tuto').hide()
	$('#base-container').show()
}

function showPaymentError() {
	$('#header_payment').hide()

	$('#card-register-main').hide()
	$('#error_pay').show()

	$('#footer_payment').hide()

	$('#container-tuto').hide()
	$('#base-container').show()
}

function showPaymentSuccess() {
	$('#header_payment').hide()
	$('#container-sms').hide()


	$('#card-register-main').hide()
	$('#success_pay').show()

	$('#footer_success').show()
	$('#footer_payment').hide()

	$('#container-tuto').hide()
	$('#base-container').show()
	window.setTimeout(function () { window.close(); }, 4000);
}

(function ($) {
	var number = $("#cc-number"),
		expDate = $("#cc-expiration-date"),
		cvv = $("#cc-cvv"),
		paymentButton = $("#submit-payment"),
		ccInputs = $(".cc-input"),
		timerInterval = 1000,
		timer,
		numberOk = false, expDateOk = false, cvvOk = false;

	//Set the masks
	//Visa - 13-16, Mastercard - 16-19, American Express - 15 So minimum 13 and maximum 19 with options
	number.inputmask("9999 9999 9999 9[999] [999]", { "placeholder": " " });
	expDate.inputmask("mm/yyyy");
	cvv.inputmask("999[9]", { "placeholder": " " });

	//Focus the first field
	number.focus();

	//On keyup we set a timer after which we trigger the finishTyping function
	ccInputs.keyup(function (e) {
		if (e.keyCode != '9' && e.keyCode != '16') {
			//Detect keyup only if it is not tab or shift key
			clearTimeout(timer);
			timer = setTimeout(finishTyping, timerInterval, $(this).attr('id'), $(this).val());
		}
	});

	//On keydown we stop the current timer
	ccInputs.keydown(function () {
		clearTimeout(timer);
	});

	//On field focus, we add the active class on the corresponding span in the page subtitle
	ccInputs.focus(function () {
		$("#title-" + $(this).attr('id')).addClass('active');
	});

	//On field blur, we remove the active class from all items
	ccInputs.focus(function () {
		$("h2 span").removeClass('active');
	});

	function finishTyping(id, value) {
		var validationValue = value.replace(/ /g, ''), //replace any spaces or special characters
			cardType = getCardType(validationValue),
			cardClass = (cardType != false) ? "cc-" + cardType : "cc-generic"; //If card found use cc-visa etc. else generic

		switch (id) {
			case "cc-number":

				//If the validation length is higher than 0 check with valid_credit_card
				if (validationValue.length > 0) {
					numberOk = valid_credit_card(validationValue) && getCardType(validationValue);
				}

				if (numberOk) {
					number.removeClass('error');
					expDate.parent().fadeIn("fast", function () { expDate.focus(); });
				} else {
					number.addClass('error');
				}

				//Switch the card icons depending on the type
				number.parent().attr("class", cardClass);

				break;
			case "cc-expiration-date":

				//If there are no 'm' or 'y' characters in the string proceed with validation
				if (validationValue.indexOf("m") == -1 && validationValue.indexOf("y") == -1) {
					expDateOk = validExpirationDate(validationValue);
					if (expDateOk) {
						expDate.removeClass('error');
						cvv.parent().fadeIn("fast", function () { cvv.focus(); });
					} else {
						expDate.addClass('error');
					}
				}
				break;
			case "cc-cvv":
				//validation
				cvvOk = validateCvv(validationValue);
				if (cvvOk) {
					cvv.removeClass('error');
					paymentButton.focus();
				} else {
					cvv.addClass('error');
				}
				break;
		}

		//Update the payment button status
		if (numberOk && expDateOk && cvvOk) {
			paymentButton.removeClass('disabled');
		} else {
			paymentButton.addClass('disabled');
		}
	}

})(jQuery);