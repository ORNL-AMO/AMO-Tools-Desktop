import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef, ChangeDetectorRef, HostListener, SimpleChanges } from '@angular/core';
import { AuxEquipment } from '../../shared/models/phast/auxEquipment';
import { PHAST } from '../../shared/models/phast/phast';
import { AuxEquipmentService } from './aux-equipment.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Settings } from '../../shared/models/settings';
@Component({
    selector: 'app-aux-equipment',
    templateUrl: 'aux-equipment.component.html',
    styleUrls: ['aux-equipment.component.css', '../../psat/explore-opportunities/explore-opportunities.component.css'],
    standalone: false
})
export class AuxEquipmentComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('save')
  save = new EventEmitter<boolean>();
  @Input()
  containerHeight: number;
  @Input()
  settings: Settings;

  @ViewChild('smallTabSelect', { static: false }) smallTabSelect: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.getContainerHeight();
  }
  

  tabSelect: string = 'results';
  currentField: string = 'fuelType';

  results: Array<{name: string, totalPower: number, motorPower: string}>;
  resultsSum: number = 0;
  smallScreenTab: string = 'baseline';
  constructor(private auxEquipmentService: AuxEquipmentService, private settingsDbService: SettingsDbService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    if (!this.phast.auxEquipment) {
      this.phast.auxEquipment = new Array<AuxEquipment>();
      this.addEquipment();
    }else {
      this.calculate();
    }
    
    if (this.settingsDbService.globalSettings.defaultPanelTab) {
      this.tabSelect = this.settingsDbService.globalSettings.defaultPanelTab;
    }    
    this.getContainerHeight();
  }

  ngOnChanges(changes: SimpleChanges) {    
    if (changes.containerHeight && !changes.containerHeight.firstChange) {
      this.getContainerHeight();
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  emitSave() {
    this.save.emit(true);
  }

  calculate() {
    this.results = this.auxEquipmentService.calculate(this.phast);
    this.resultsSum = this.auxEquipmentService.getResultsSum(this.results);
  }

  setField(str: string) {
    this.currentField = str;
  }

  addEquipment() {
    let eqNum = 1;
    if (this.phast.auxEquipment) {
      eqNum = this.phast.auxEquipment.length + 1;
    }
    let tmpAuxEquipment: AuxEquipment = {
      name: 'Equipment #' + eqNum,
      dutyCycle: 100,
      motorPower: 'Calculated',
      motorPhase: '3',
      supplyVoltage: 0,
      averageCurrent: 0,
      powerFactor: .85,
      totalConnectedPower: 0,
      ratedCapacity: 0
    }
    this.phast.auxEquipment.push(tmpAuxEquipment);
    this.calculate();
  }

  removeEquipment(index: number) {
    this.phast.auxEquipment.splice(index, 1);
    this.calculate();
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  getContainerHeight() {
    if (this.smallTabSelect && this.smallTabSelect.nativeElement) {
      this.containerHeight = this.containerHeight - this.smallTabSelect.nativeElement.offsetHeight;
      this.cd.detectChanges();
    }
  }

}
