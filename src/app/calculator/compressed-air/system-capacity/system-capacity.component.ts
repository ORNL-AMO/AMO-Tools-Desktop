import { Component, OnInit, ViewChild, ElementRef, HostListener, Input } from '@angular/core';
import { StandaloneService } from "../../standalone.service";
import { AirSystemCapacityInput, AirSystemCapacityOutput } from "../../../shared/models/standalone";
import { Settings } from '../../../shared/models/settings';
import { SystemCapacityService } from './system-capacity.service';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-system-capacity',
  templateUrl: './system-capacity.component.html',
  styleUrls: ['./system-capacity.component.css']
})
export class SystemCapacityComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  inModal: boolean
  @Output('emitTotalCapacity')
  emitTotalCapacity = new EventEmitter<number>();
  
  @ViewChild('leftPanelHeader', { static: false }) leftPanelHeader: ElementRef;
  @ViewChild('contentContainer', { static: false }) contentContainer: ElementRef;
  
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }
  
  bodyHeight: number;
  headerHeight: number;
  inputs: AirSystemCapacityInput;
  outputs: AirSystemCapacityOutput;
  currentField: string = 'default';

  constructor(private standaloneService: StandaloneService, private systemCapacityService: SystemCapacityService, private settingsDbService: SettingsDbService) {
  }

  ngOnInit() {
    this.outputs = this.systemCapacityService.getDefaultEmptyOutput();
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.inputs = this.systemCapacityService.inputs;
    this.calculate();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 200);
  }

  ngOnDestroy(){
    this.systemCapacityService.inputs = this.inputs;
  }
  
  btnResetData() {
    this.inputs = this.systemCapacityService.getSystemCapacityDefaults();
    this.calculate();
  }

  resizeTabs() {
    if (this.leftPanelHeader) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
      this.bodyHeight = this.contentContainer.nativeElement.offsetHeight;
    }
  }

  calculate() {
    this.outputs = this.standaloneService.airSystemCapacity(this.inputs, this.settings);
    if (this.inModal) {
      this.emitTotalCapacity.emit(this.outputs.totalCapacityOfCompressedAirSystem);
    }
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
