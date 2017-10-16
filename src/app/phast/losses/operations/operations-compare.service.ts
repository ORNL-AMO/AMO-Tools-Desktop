import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { OperatingHours, OperatingCosts, PHAST } from '../../../shared/models/phast/phast';

@Injectable()
export class OperationsCompareService {

  baseline: PHAST;
  modification: PHAST;

  differentObject: OperationsDifferentObject

  constructor() { }


  initCompareObjects() {
    if (this.baseline && this.modification) {
      this.differentObject = this.initDifferentObject();
      this.checkDifferent();
    }
  }

  checkDifferent() {
    if (this.baseline && this.modification) {
      this.differentObject.weeksPerYear.next(this.compare(this.baseline.operatingHours.weeksPerYear, this.modification.operatingHours.weeksPerYear));
      this.differentObject.daysPerWeek.next(this.compare(this.baseline.operatingHours.daysPerWeek, this.modification.operatingHours.daysPerWeek));
      this.differentObject.shiftsPerDay.next(this.compare(this.baseline.operatingHours.shiftsPerDay, this.modification.operatingHours.shiftsPerDay));
      this.differentObject.hoursPerShift.next(this.compare(this.baseline.operatingHours.hoursPerShift, this.modification.operatingHours.hoursPerShift));
      this.differentObject.hoursPerYear.next(this.compare(this.baseline.operatingHours.hoursPerYear, this.modification.operatingHours.hoursPerYear));
      this.differentObject.fuelCost.next(this.compare(this.baseline.operatingCosts.fuelCost, this.modification.operatingCosts.fuelCost));
      this.differentObject.steamCost.next(this.compare(this.baseline.operatingCosts.steamCost, this.modification.operatingCosts.steamCost));
      this.differentObject.electricityCost.next(this.compare(this.baseline.operatingCosts.electricityCost, this.modification.operatingCosts.electricityCost));
    } else {
      this.disableAll();
    }
  }

  disableAll() {
    this.differentObject.weeksPerYear.next(false);
    this.differentObject.daysPerWeek.next(false);
    this.differentObject.shiftsPerDay.next(false);
    this.differentObject.hoursPerShift.next(false);
    this.differentObject.hoursPerYear.next(false);
    this.differentObject.fuelCost.next(false);
    this.differentObject.steamCost.next(false);
    this.differentObject.electricityCost.next(false);
  }


  initDifferentObject(): OperationsDifferentObject {
    let tmpDifferent: OperationsDifferentObject = {
      weeksPerYear: new BehaviorSubject<boolean>(null),
      daysPerWeek: new BehaviorSubject<boolean>(null),
      shiftsPerDay: new BehaviorSubject<boolean>(null),
      hoursPerShift: new BehaviorSubject<boolean>(null),
      hoursPerYear: new BehaviorSubject<boolean>(null),
      fuelCost: new BehaviorSubject<boolean>(null),
      steamCost: new BehaviorSubject<boolean>(null),
      electricityCost: new BehaviorSubject<boolean>(null),
    }
    return tmpDifferent;
  }


  compare(a: any, b: any) {
    //if both exist
    if (a && b) {
      //compare
      if (a != b) {
        //not equal
        return true;
      } else {
        //equal
        return false;
      }
    }
    //check one exists
    else if ((a && !b) || (!a && b)) {
      //not equal
      return true
    } else {
      //equal
      return false;
    }
  }
}

export interface OperationsDifferentObject {
  weeksPerYear: BehaviorSubject<boolean>,
  daysPerWeek: BehaviorSubject<boolean>,
  shiftsPerDay: BehaviorSubject<boolean>,
  hoursPerShift: BehaviorSubject<boolean>,
  hoursPerYear: BehaviorSubject<boolean>,
  fuelCost: BehaviorSubject<boolean>,
  steamCost: BehaviorSubject<boolean>,
  electricityCost: BehaviorSubject<boolean>,
}
