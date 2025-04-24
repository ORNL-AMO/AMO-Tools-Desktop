import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { AirHeatingService } from '../air-heating.service';

@Component({
    selector: 'app-air-heating-help',
    templateUrl: './air-heating-help.component.html',
    styleUrls: ['./air-heating-help.component.css'],
    standalone: false
})
export class AirHeatingHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  
  currentFieldSub: Subscription;
  currentField: string;

  constructor(private airheatingService: AirHeatingService) { }
  
  ngOnInit(): void {
    this.currentFieldSub = this.airheatingService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }
  
  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

}
