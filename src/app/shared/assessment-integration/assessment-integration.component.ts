import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { AssessmentIntegrationService, ExistingIntegrationData, IntegratedAssessment } from './assessment-integration.service';
import { FormControl, FormGroup } from '@angular/forms';
import { AssessmentOption } from '../connected-inventory/integrations';
import { Assessment, AssessmentType } from '../models/assessment';
import * as _ from 'lodash';
import { Settings } from '../models/settings';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { TreasureHuntService } from '../../treasure-hunt/treasure-hunt.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-assessment-integration',
    templateUrl: './assessment-integration.component.html',
    styleUrls: ['./assessment-integration.component.css'],
    standalone: false
})
export class AssessmentIntegrationComponent implements OnInit {
  @Input()
  existingIntegrationData: ExistingIntegrationData;
  @Input()
  settings: Settings;
  @Output('integratedAssessmentSelected')
  integratedAssessmentSelected = new EventEmitter<IntegratedAssessment>();
  assessmentIntegrationForm: FormGroup;
  assessmentOptions: AssessmentOption[];
  assessments: Assessment[];
  integratedAssessment: IntegratedAssessment;
  hasUpdatedEnergyData: boolean;

  @ViewChild('reportModal', { static: false }) public reportModal: ModalDirective;
  @ViewChild('modalDialog', { static: false }) public modalDialog: ElementRef;
  showReport: boolean;

  reportSub: Subscription;
  constructor(private assessmentIntegrationService: AssessmentIntegrationService, private treasureHuntService: TreasureHuntService) { }

  async ngOnInit() {
    let defaultAssessmentType: AssessmentType = 'PSAT';
    this.assessmentIntegrationForm = new FormGroup({
      assessmentType: new FormControl<string>(defaultAssessmentType),
      integratedAssessment: new FormControl<any>({ value: null, disabled: false }),
      selectedModificationId: new FormControl<string>({ value: null, disabled: false }),
    });
    if (this.existingIntegrationData) {
      await this.setExistingIntegratedAssessment();
    } else {
      await this.setAssessmentOptions();
    }

    this.reportSub = this.reportModal.onShown.subscribe(val => {
      this.showReport = true;
    })
  }

  ngOnDestroy() {
    this.reportSub.unsubscribe();
  }

  async setAssessmentOptions() {
    this.assessmentOptions = await this.assessmentIntegrationService.getAssessmentOptionsByType(this.assessmentIntegrationForm.controls.assessmentType.value);
  }

  async setExistingIntegratedAssessment() {
    this.integratedAssessment = await this.assessmentIntegrationService.setIntegratedAssessment(this.existingIntegrationData.assessmentId, this.existingIntegrationData.assessmentType, this.settings);
    this.integratedAssessment.selectedModificationId = this.existingIntegrationData.selectedModificationId;
    this.assessmentIntegrationForm.controls.assessmentType.patchValue(this.existingIntegrationData.assessmentType);
    this.assessmentIntegrationForm.controls.assessmentType.disable();

    if (!this.integratedAssessment.assessment) {
      this.integratedAssessment.name = this.existingIntegrationData.assessmentName
    } else {
      this.hasUpdatedEnergyData = this.assessmentIntegrationService.checkHasUpdatedEnergyData(this.existingIntegrationData.energyOptions, this.integratedAssessment.energyOptions);
    }
  }

  async updateExistingIntegrationData() {
    this.existingIntegrationData.energyOptions.baseline = this.integratedAssessment.energyOptions.baseline;
    if (this.integratedAssessment.hasModifications) {
      this.integratedAssessment.energyOptions.modifications.forEach((modification) => {
        if (modification.modificationId === this.existingIntegrationData.energyOptions.modifications[0].modificationId) {
          this.existingIntegrationData.energyOptions.modifications[0].annualEnergy = modification.annualEnergy;
          this.existingIntegrationData.energyOptions.modifications[0].co2EmissionsOutput = modification.co2EmissionsOutput;
          this.existingIntegrationData.energyOptions.modifications[0].annualCost = modification.annualCost;
          this.existingIntegrationData.energyOptions.modifications[0].name = modification.name;
        }
      });
    }
    this.hasUpdatedEnergyData = false;
    this.integratedAssessmentSelected.emit(this.integratedAssessment);
  }

  async setNewIntegratedAssessment() {
    this.integratedAssessment = await this.assessmentIntegrationService.setIntegratedAssessment(this.assessmentIntegrationForm.controls.integratedAssessment.value, this.assessmentIntegrationForm.controls.assessmentType.value, this.settings);
    if (this.integratedAssessment.hasModifications) {
      let defaultSelectedId: string = this.integratedAssessment.energyOptions.modifications[0].modificationId;
      this.assessmentIntegrationForm.controls.selectedModificationId.patchValue(defaultSelectedId);
      this.integratedAssessment.selectedModificationId = defaultSelectedId;
    }
    this.integratedAssessmentSelected.emit(this.integratedAssessment);
  }

  setSelectedModification() {
    this.integratedAssessment.selectedModificationId = this.assessmentIntegrationForm.controls.selectedModificationId.value;
    this.integratedAssessmentSelected.emit(this.integratedAssessment);
  }

  goToAssessment() {
    this.assessmentIntegrationService.navigateToIntegratedAssessment(this.integratedAssessment);
  }

  focusField(focusedField: string) { }

  showReportModal() {
    this.reportModal.show();
    this.treasureHuntService.modalOpen.next(true);
  }

  hideReportModal() {
    this.reportModal.hide();
    this.treasureHuntService.modalOpen.next(false)
    this.showReport = false;
  }

}
