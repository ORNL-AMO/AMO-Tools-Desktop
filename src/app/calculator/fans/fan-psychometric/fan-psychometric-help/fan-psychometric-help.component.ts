import { Component, OnInit } from '@angular/core';
import { FanPsychometricService } from '../fan-psychometric.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-fan-psychometric-help',
  templateUrl: './fan-psychometric-help.component.html',
  styleUrls: ['./fan-psychometric-help.component.css']
})
export class FanPsychometricHelpComponent implements OnInit {

  constructor(private fanPsychometricService: FanPsychometricService) { }

  currentField: string;
  currentFieldSub: Subscription;
  
  ngOnInit(): void {
    this.currentFieldSub = this.fanPsychometricService.currentField.subscribe(value => {
      this.currentField = value;
    })
  }

  ngOnDestroy() {
    this.currentFieldSub.unsubscribe();
  }

}
