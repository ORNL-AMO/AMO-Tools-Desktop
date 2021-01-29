import { Component, OnInit, Input } from '@angular/core';
import { Subscription } from 'rxjs';
import { BoilerBlowdownRateService, BoilerBlowdownRateRanges } from '../boiler-blowdown-rate.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-blowdown-rate-help',
  templateUrl: './blowdown-rate-help.component.html',
  styleUrls: ['./blowdown-rate-help.component.css']
})
export class BlowdownRateHelpComponent implements OnInit {
  @Input()
  settings: Settings;
  
  currentField: string;
  currentFieldSub: Subscription;
  ranges: BoilerBlowdownRateRanges;
  displaySuggestions: boolean = false;
  constructor(private boilerBlowdownRateService: BoilerBlowdownRateService) { }

  ngOnInit() {
    this.currentFieldSub = this.boilerBlowdownRateService.currentField.subscribe(val => {
      this.currentField = val;
    });
    this.ranges = this.boilerBlowdownRateService.getRanges(this.settings);
  }

  ngOnDestroy() {
    this.currentFieldSub.unsubscribe();
  }

  toggleSuggestions() {
    this.displaySuggestions = !this.displaySuggestions;
  }

}
