import { Component, OnInit, Input, ElementRef, ViewChild, HostListener } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
import { PsatService } from '../../../psat/psat.service';
import { Settings } from '../../../shared/models/settings';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { FormGroup } from '@angular/forms';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { SpecificSpeedService } from './specific-speed.service';
@Component({
  selector: 'app-specific-speed',
  templateUrl: './specific-speed.component.html',
  styleUrls: ['./specific-speed.component.css']
})
export class SpecificSpeedComponent implements OnInit {
  @Input()
  psat: PSAT;
  @Input()
  settings: Settings;
  @Input()
  inPsat: boolean;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  currentField: string;
  speedForm: FormGroup;
  specificSpeed: number;
  efficiencyCorrection: number;
  toggleCalculate: boolean = true;
  tabSelect: string = 'results';
  constructor(private psatService: PsatService, private specificSpeedService: SpecificSpeedService, private settingsDbService: SettingsDbService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    if (!this.psat) {
      if (!this.specificSpeedService.speedForm) {
        this.speedForm = this.psatService.initForm();
        this.speedForm.patchValue({
          pumpType: this.psatService.getPumpStyleFromEnum(0),
          pumpRPM: 1780,
          flowRate: 2000,
          head: 277
        })
        if (this.settings.flowMeasurement != 'gpm') {
          let tmpVal = this.convertUnitsService.value(this.speedForm.controls.flowRate.value).from('gpm').to(this.settings.flowMeasurement);
          this.speedForm.patchValue({
            flowRate: this.psatService.roundVal(tmpVal, 2)
          })
        }
        if (this.settings.distanceMeasurement != 'ft') {
          let tmpVal = this.convertUnitsService.value(this.speedForm.controls.head.value).from('ft').to(this.settings.distanceMeasurement);
          this.speedForm.patchValue({
            head: this.psatService.roundVal(tmpVal, 2)
          })
        }
      } else {
        this.speedForm = this.specificSpeedService.speedForm;
      }
    } else {
      this.speedForm = this.psatService.getFormFromPsat(this.psat.inputs);
    }

    //get settings if standalone
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy(){
    this.specificSpeedService.speedForm = this.speedForm;
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  calculate() {
    this.toggleCalculate = !this.toggleCalculate;
  }
  setTab(str: string) {
    this.tabSelect = str;
  }
  changeField(str: string) {
    this.currentField = str;
  }
}
