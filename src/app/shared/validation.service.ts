import { Injectable } from '@angular/core';
import * as moment from 'moment';

@Injectable()
export class ValidationService {

  constructor() { }

  static getValidatorErrorMessage(validatorName: string, validatorValue?: any) {
    let config = {
      'required': 'Required',
      'invalidCreditCard': 'Invalid credit card number',
      'invalidEmailAddress': 'Invalid email address',
      'invalidPassword': 'Invalid password. Password must be at least 6 characters long, and contain a number.',
      'invalidZip': 'Invalid Zip Code',
      'invalidPhone': 'Invalid Phone Number',
      'invalidInteger': 'Please enter a whole number',
      'minlength': `Minimum length ${validatorValue.requiredLength}`,
      'invalidDecimal': 'Please enter a valid number',
      'invalidDate': 'Future dates are not allowed'
    };

    return config[validatorName];
  }

  static creditCardValidator(control) {
    // Visa, MasterCard, American Express, Diners Club, Discover, JCB
    if (control.value.match(/^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|6(?:011|5[0-9][0-9])[0-9]{12}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|(?:2131|1800|35\d{3})\d{11})$/)) {
      return null;
    } else {
      return { 'invalidCreditCard': true };
    }
  }

  static emailValidator(control) {
    // RFC 2822 compliant regex
    if (control.value.match(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/)) {
      return null;
    }
    else if(control.value.match(/^$/)){
      return null; //this will prevent emails that are optional from being invalid
    }
    else {
      return { 'invalidEmailAddress': true };
    }
  }

  static passwordValidator(control) {
    // {6,100}           - Assert password is between 6 and 100 characters
    // (?=.*[0-9])       - Assert a string has at least one number
    if (control.value.match(/^(?=.*[0-9])[a-zA-Z0-9!@#$%^&*]{6,100}$/)) {
      return null;
    } else {
      return { 'invalidPassword': true };
    }
  }

  static zipValidator(control){
    if(control.value.match(/^([0-9]{5})$/)){
      return null;
    }else {
      return { 'invalidZip' : true};
    }
  }

  static phoneValidator(control){
    if(control.value.match(/^([0-9]{10})$/)){
      return null;
    }
    else if(control.value.match(/^$/)){
      return null; //this will prevent phones that are optional from being invalid
    }
    else {
      return {'invalidPhone': true};
    }
  }

  static integerValidator(control){
    if(control.value.match(/^\d+$/)){
      return null;
    }
    else if(control.value.match(/^$/)){
      return null;
    }
    else {
      return {'invalidInteger': true};
    }
  }

  static decimalValidator(control){
    if(control.value.match(/^[+]?([.]\d+|\d+([.]\d+)?)$/)){
      return null;
    }
    else if(control.value.match(/^$/)){
      return null;
    }
    else {
      return {'invalidDecimal': true};
    }
  }

  static pastDateValidator(control){
    let today = new Date();
    let testDate = moment(control.value);
    let diff = testDate.diff(today, 'days');
    if(diff <= 0){
      return null;
    }
    else if(diff >> 0){
      return {'invalidDate': true}
    }
  }


}
