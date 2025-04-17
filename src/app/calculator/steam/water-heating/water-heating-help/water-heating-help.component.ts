import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { Settings } from '../../../../shared/models/settings';
import { WaterHeatingService } from '../water-heating.service';

@Component({
    selector: 'app-water-heating-help',
    templateUrl: './water-heating-help.component.html',
    styleUrls: ['./water-heating-help.component.css'],
    standalone: false
})
export class WaterHeatingHelpComponent implements OnInit {

  @Input()
  settings: Settings;
  
  currentFieldSub: Subscription;
  currentField: string;

  constructor(private waterHeatingService: WaterHeatingService) { }
  
  ngOnInit(): void {
    this.currentFieldSub = this.waterHeatingService.currentField.subscribe(val => {
      this.currentField = val;
    });
  }
  
  ngOnDestroy(): void {
    this.currentFieldSub.unsubscribe();
  }

}
