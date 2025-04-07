import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { WaterUsingSystemService } from '../../water-using-system.service';
import { WaterUsingSystem, WaterSystemTypeEnum, WaterSystemTypeData } from 'process-flow-lib';

@Component({
  selector: 'app-water-system-data-modal',
  templateUrl: './water-system-data-modal.component.html',
  styleUrl: './water-system-data-modal.component.css'
})
export class WaterSystemDataModalComponent {
  @Input()
  waterUsingSystem: WaterUsingSystem;
  @Input()
  systemType: number;
  @Input()
  settings: Settings;
  @Output()
  emitClose = new EventEmitter<boolean>();
  @Output()
  emitSave = new EventEmitter<WaterUsingSystem>();

  smallScreenTab: string = 'form';
  containerHeight: number;
  headerHeight: number;
  tabSelect: string = 'results';
  currentField: string;
  systemTypeName: string;
  WaterSystemTypeEnum = WaterSystemTypeEnum;

  @ViewChild('waterSystemDataModal', { static: false }) public waterSystemDataModal: ModalDirective;
  constructor(private waterUsingSystemService: WaterUsingSystemService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.systemTypeName = this.waterUsingSystemService.getSystemTypeName(this.systemType);
  }

  updateSystemTypeData(updatedSystemTypeData: WaterSystemTypeData) {
    this.waterUsingSystemService.setUpdatedSystemTypeData(this.waterUsingSystem, updatedSystemTypeData, this.systemType);
    this.cd.detectChanges();
  }

  save() {
    this.emitSave.emit(this.waterUsingSystem);
    this.hideModal();
  }

  ngAfterViewInit() {
    this.showModal();
  }

  showModal() {
    this.waterSystemDataModal.show();
  }

  hideModal() {
    this.waterSystemDataModal.hide();
    this.emitClose.emit(true);
  }

  setTab(str: string) {
    this.tabSelect = str;
  }


  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }

  changeField(str: string) {
    this.currentField = str;
  }

  
}
