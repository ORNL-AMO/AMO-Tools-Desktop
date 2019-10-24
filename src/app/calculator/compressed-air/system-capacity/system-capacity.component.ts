import { Component, OnInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { AirSystemCapacityInput, AirSystemCapacityOutput } from "../../../shared/models/standalone";
import { Settings } from '../../../shared/models/settings';
import { SystemCapacityService } from './system-capacity.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';

@Component({
  selector: 'app-system-capacity',
  templateUrl: './system-capacity.component.html',
  styleUrls: ['./system-capacity.component.css']
})
export class SystemCapacityComponent implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;

  inputs: AirSystemCapacityInput;
  outputs: AirSystemCapacityOutput = {
    totalPipeVolume: 0,
    totalReceiverVolume: 0,
    totalCapacityOfCompressedAirSystem: 0,
    receiverCapacities: [0],
  };
  currentField: string = 'default';

  constructor(private standaloneService: StandaloneService, private systemCapacityService: SystemCapacityService, private settingsDbService: SettingsDbService) {
  }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.inputs = this.systemCapacityService.inputs;
    this.calculate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy(){
    this.systemCapacityService.inputs = this.inputs;
  }
  
  btnResetData() {
    this.inputs = this.systemCapacityService.getSystemCapacityDefaults();
    this.calculate();
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  calculate() {
    this.outputs = this.standaloneService.airSystemCapacity(this.inputs, this.settings);
  }

  changeField($event) {
    this.currentField = $event;
  }

  btnGenerateExample() {
    let tempInputs = this.systemCapacityService.getSystemCapacityExample();
    this.inputs = this.systemCapacityService.convertAirSystemCapacityExample(tempInputs, this.settings);
    this.calculate();
  }
}
