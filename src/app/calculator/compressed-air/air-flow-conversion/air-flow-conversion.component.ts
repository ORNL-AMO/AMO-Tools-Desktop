import { Component, OnInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { AirFlowConversionService } from './air-flow-conversion.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Subscription } from 'rxjs';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-air-flow-conversion',
  templateUrl: './air-flow-conversion.component.html',
  styleUrls: ['./air-flow-conversion.component.css']
})
export class AirFlowConversionComponent implements OnInit {
  @Input()
  settings: Settings;
  headerHeight: number;
  currentField: string = 'default';
  form: FormGroup;

  airFlowConversionInputSub: Subscription;
  currentFieldSub: Subscription;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  
  constructor(private airFlowConversionService: AirFlowConversionService,
              private settingsDbService: SettingsDbService) { }

  ngOnInit(): void {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.airFlowConversionService.initDefaultEmptyInputs(this.settings);
    this.airFlowConversionService.initDefaultEmptyOutputs();
    this.initSubscriptions();
  }

  ngOnDestroy() {
    this.airFlowConversionInputSub.unsubscribe();
    this.currentFieldSub.unsubscribe();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  initSubscriptions() {
    this.airFlowConversionInputSub = this.airFlowConversionService.airFlowConversionInput.subscribe(value => {
      this.calculate();
    })
    this.currentFieldSub = this.airFlowConversionService.currentField.subscribe(value => {
      this.currentField = value;
    })
  }

  calculate() {
    this.airFlowConversionService.calculate(this.settings);
  }
  

  btnResetData() {
    this.airFlowConversionService.initDefaultEmptyInputs(this.settings);
    this.airFlowConversionService.resetData.next(true);
  }

  btnGenerateExample() {
    this.airFlowConversionService.generateExampleData(this.settings);
    this.airFlowConversionService.generateExample.next(true);
  }

}
