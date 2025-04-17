import { Component, OnInit } from '@angular/core';
import { SystemAndEquipmentCurveService } from '../system-and-equipment-curve.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-system-and-equipment-curve-help',
    templateUrl: './system-and-equipment-curve-help.component.html',
    styleUrls: ['./system-and-equipment-curve-help.component.css'],
    standalone: false
})
export class SystemAndEquipmentCurveHelpComponent implements OnInit {

  focusedCalculator: string;
  focusedCalculatorSub: Subscription;
  currentField: string;
  currentFieldSub: Subscription;
  constructor(private systemAndEquipmentCurveService: SystemAndEquipmentCurveService) { }

  ngOnInit() {
    this.focusedCalculatorSub = this.systemAndEquipmentCurveService.focusedCalculator.subscribe(val => {
      this.focusedCalculator = val;
    });
    this.currentFieldSub = this.systemAndEquipmentCurveService.currentField.subscribe(val => {
      this.currentField = val;
    })
  }

  ngOnDestroy(){
    this.focusedCalculatorSub.unsubscribe();
    this.currentFieldSub.unsubscribe();
  }

}
