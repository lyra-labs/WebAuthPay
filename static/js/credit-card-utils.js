// takes the form field value and returns true on valid number
function valid_credit_card(value) {
    // accept only digits, dashes or spaces
      if (/[^0-9-\s]+/.test(value)) return false;
  
      // The Luhn Algorithm. It's so pretty.
      var nCheck = 0, nDigit = 0, bEven = false;
      value = value.replace(/\D/g, "");
  
      for (var n = value.length - 1; n >= 0; n--) {
          var cDigit = value.charAt(n),
                nDigit = parseInt(cDigit, 10);
  
          if (bEven) {
              if ((nDigit *= 2) > 9) nDigit -= 9;
          }
  
          nCheck += nDigit;
          bEven = !bEven;
      }
  
      return (nCheck % 10) == 0;
  }
  
  /*
  * Validates the expiration date
  */
  function validExpirationDate(date) {
      var currentDate = new Date(),
          currentMonth = currentDate.getMonth() + 1,//Zero based index
          currentYear = currentDate.getFullYear(),
          expirationMonth = Number(date.substr(0,2)), //01/
          expirationYear = Number(date.substr(3,date.length)); //starts at 3 after month's slash
  
      //The expiration date must be atleast one month ahead of current date
      if((expirationYear < currentYear) || (expirationYear == currentYear && expirationMonth <= currentMonth)){
          return false;
      }else{
          return true;
      }
  }
  
  /*
  * Validates the security code(cvv)
  */
  function validateCvv(cvv) {
      //The cvv must be atleast 3 digits
      return cvv.length > 2;
  }
  
  /*
  * Retrieve the card issuing bank.
  */
  function getCardType(ccNumber) {
      // Define regular expressions in an object
      var cardPatterns = {
              visa: /^4[0-9]{12}(?:[0-9]{3})?$/,
              mastercard: /^5[1-5][0-9]{14}$/,
              amex: /^3[47][0-9]{13}$/,
              diners: /^3(?:0[0-5]|[68][0-9])[0-9]{11}$/,
              discover: /^6(?:011|5[0-9]{2})[0-9]{12}$/,
              jbc: /^(?:2131|1800|35\d{3})\d{11}$/
          };
      for (var cardPattern in cardPatterns){
          if(cardPatterns[cardPattern].test(ccNumber)) {
              return cardPattern;
          }
      }
  }
