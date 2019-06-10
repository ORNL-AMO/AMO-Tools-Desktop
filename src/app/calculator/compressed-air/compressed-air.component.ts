import { Component, OnInit, Input, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { CalculatorService } from '../calculator.service';
import { Settings } from '../../shared/models/settings';
import { SettingsDbService } from '../../indexedDb/settings-db.service';

@Component({
  selector: 'app-compressed-air',
  templateUrl: './compressed-air.component.html',
  styleUrls: ['./compressed-air.component.css']
})
export class CompressedAirComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  selectedTool: string;

  constructor(private calculatorService: CalculatorService, private settingsDbService: SettingsDbService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
  }

  showTool(str: string) {
    this.calculatorService.selectedTool.next(str);
    this.calculatorService.selectedToolType.next('compressed-air');
  }

}
