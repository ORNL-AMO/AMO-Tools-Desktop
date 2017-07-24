import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../psat.service';
import { Settings } from '../../../shared/models/settings';
import { HelpPanelService } from '../help-panel.service';
@Component({
  selector: 'app-motor-help',
  templateUrl: './motor-help.component.html',
  styleUrls: ['./motor-help.component.css']
})
export class MotorHelpComponent implements OnInit {
  currentField: string;
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;

  flaExpectedMin: number = 0;
  flaExpectedMax: number = 0;



  constructor(private helpPanelService: HelpPanelService, private psatService: PsatService) { }

  ngOnInit() {
    this.helpPanelService.currentField.subscribe((val) => {
      this.currentField = val;
    })
  }


  getFlaMin() {
    return this.psatService.flaRange.flaMin;
  }

  getFlaMax() {
    return this.psatService.flaRange.flaMax;
  }
}
