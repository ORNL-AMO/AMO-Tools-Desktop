import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../psat.service';
import { Settings } from '../../../shared/models/settings';
import { HelpPanelService } from '../help-panel.service';
import { Subscription } from 'rxjs';
@Component({
    selector: 'app-motor-help',
    templateUrl: './motor-help.component.html',
    styleUrls: ['./motor-help.component.css'],
    standalone: false
})
export class MotorHelpComponent implements OnInit {
  currentField: string;
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;

  flaExpectedMin: number = 0;
  flaExpectedMax: number = 0;

  currentFieldSub: Subscription;

  constructor(private helpPanelService: HelpPanelService, private psatService: PsatService) { }

  ngOnInit() {
    this.currentFieldSub = this.helpPanelService.currentField.subscribe((val) => {
      this.currentField = val;
    })
  }

  ngOnDestroy(){
    this.currentFieldSub.unsubscribe();
  }


  getFlaMin() {
    return this.psatService.flaRange.flaMin;
  }

  getFlaMax() {
    return this.psatService.flaRange.flaMax;
  }
}
