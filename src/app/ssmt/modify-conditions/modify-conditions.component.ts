import { Component, OnInit, Output, Input, EventEmitter } from '@angular/core';
import { SsmtService } from '../ssmt.service';
import { SSMT, BoilerInput, HeaderInput, TurbineInput } from '../../shared/models/steam/ssmt';
import { Subscription } from 'rxjs';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-modify-conditions',
  templateUrl: './modify-conditions.component.html',
  styleUrls: ['./modify-conditions.component.css']
})
export class ModifyConditionsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  ssmt: SSMT;
  @Input()
  modificationIndex: number;
  @Input()
  modificationExists: boolean;
  @Output('emitSaveAssessment')
  emitSaveAssessment = new EventEmitter<SSMT>();
  @Input()
  containerHeight: number;

  modelTab: string;
  modelTabSub: Subscription;
  baselineSelected: boolean = false;
  modifiedSelected: boolean = true;
  isModalOpen: boolean;
  modalOpenSubscription: Subscription;
  constructor(private ssmtService: SsmtService) { }

  ngOnInit() {
    this.modelTabSub = this.ssmtService.steamModelTab.subscribe(val => {
      this.modelTab = val;
    })

    this.modalOpenSubscription = this.ssmtService.modalOpen.subscribe(isOpen => {
      this.isModalOpen = isOpen;
    })
  }

  ngOnChanges() {
  }

  ngOnDestroy() {
    this.modelTabSub.unsubscribe();
    this.modalOpenSubscription.unsubscribe();
  }

  togglePanel(bool: boolean) {
    if (bool == this.baselineSelected) {
      this.baselineSelected = true;
      this.modifiedSelected = false;
    }
    else if (bool == this.modifiedSelected) {
      this.modifiedSelected = true;
      this.baselineSelected = false;
    }
  }

  addModification() {
    this.ssmtService.modalOpen.next(true);
    this.ssmtService.openNewModificationModal.next(true);
  }

  saveAssessment() {
    this.emitSaveAssessment.emit(this.ssmt);
  }

  saveBaselineBoiler(newBoiler: BoilerInput) {
    this.ssmt.boilerInput = newBoiler;
    this.saveAssessment();
  }

  saveBaselineHeader(newHeaderInput: HeaderInput) {
    this.ssmt.headerInput = newHeaderInput;
    this.saveAssessment();
  }

  saveBaselineTurbine(newTurbineInput: TurbineInput) {
    this.ssmt.turbineInput = newTurbineInput;
    this.saveAssessment();
  }

  saveModBoiler(newBoiler: BoilerInput) {
    this.ssmt.modifications[this.modificationIndex].ssmt.boilerInput = newBoiler;
    this.saveAssessment();
  }

  saveModHeader(newHeaderInput: HeaderInput) {
    this.ssmt.modifications[this.modificationIndex].ssmt.headerInput = newHeaderInput;
    this.saveAssessment();
  }

  saveModTurbine(newTurbineInput: TurbineInput) {
    this.ssmt.modifications[this.modificationIndex].ssmt.turbineInput = newTurbineInput;
    this.saveAssessment();
  }
}
