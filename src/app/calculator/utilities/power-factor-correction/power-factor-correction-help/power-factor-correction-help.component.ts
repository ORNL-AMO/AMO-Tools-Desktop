import { Component, OnInit } from '@angular/core';
import { PowerFactorCorrectionService } from '../power-factor-correction.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-power-factor-correction-help',
    templateUrl: './power-factor-correction-help.component.html',
    styleUrls: ['./power-factor-correction-help.component.css'],
    standalone: false
})
export class PowerFactorCorrectionHelpComponent implements OnInit {
  currentField: string;
  currentFieldSub: Subscription;
  constructor(private powerFactorCorrectionService: PowerFactorCorrectionService) { }

  ngOnInit() {
    this.currentFieldSub = this.powerFactorCorrectionService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }

  ngOnDestroy() {
    this.currentFieldSub.unsubscribe();
  }

}
