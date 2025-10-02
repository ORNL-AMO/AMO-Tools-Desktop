import { Component, ViewChild } from '@angular/core';
import { Co2SavingsData } from '../../../../calculator/utilities/co2-savings/co2-savings.service';
import { CompressedAirAssessment, SystemInformation } from '../../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { UntypedFormGroup } from '@angular/forms';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { AssessmentCo2SavingsService } from '../../../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { SystemInformationFormService } from './system-information-form.service';
import { SystemProfileService } from '../../../system-profile/system-profile.service';
import { AltitudeCorrectionService } from '../../../../calculator/utilities/altitude-correction/altitude-correction.service';

@Component({
  selector: 'app-system-information-form',
  templateUrl: './system-information-form.component.html',
  styleUrl: './system-information-form.component.css',
  standalone: false
})
export class SystemInformationFormComponent {

  settings: Settings;
  @ViewChild('systemCapacityModal', { static: false }) public systemCapacityModal: ModalDirective;
  showSystemCapacityModal: boolean = false;
  form: UntypedFormGroup;
  co2SavingsData: Co2SavingsData;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService,
    private systemInformationFormService: SystemInformationFormService, private systemProfileService: SystemProfileService,
    private altitudeCorrectionService: AltitudeCorrectionService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.form = this.systemInformationFormService.getFormFromObj(compressedAirAssessment.systemInformation, this.settings);
    this.setCo2SavingsData(compressedAirAssessment);
  }

  save(co2SavingsData?: Co2SavingsData) {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let systemInformation: SystemInformation = this.systemInformationFormService.updateObjFromForm(this.form, compressedAirAssessment.systemInformation);
    if (co2SavingsData) {
      systemInformation.co2SavingsData = co2SavingsData;
      this.co2SavingsData = co2SavingsData;
    }
    else if (this.co2SavingsData) {
      systemInformation.co2SavingsData = this.co2SavingsData;
    }
    compressedAirAssessment.systemInformation = systemInformation;

    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  openSystemCapacityModal() {
    this.showSystemCapacityModal = true;
    this.systemCapacityModal.show();
    this.compressedAirAssessmentService.modalOpen.next(true);
  }

  closeSystemCapacityModal(totalCapacityOfCompressedAirSystem?: number) {
    if (totalCapacityOfCompressedAirSystem) {
      this.form.patchValue({
        totalAirStorage: totalCapacityOfCompressedAirSystem
      });
    }
    this.systemCapacityModal.hide();
    this.compressedAirAssessmentService.modalOpen.next(false);
    this.showSystemCapacityModal = false;
    this.save();
  }

  changeCompressorOrderingMethod() {
    this.form = this.systemInformationFormService.setSequencerFieldValidators(this.form);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let systemInformation: SystemInformation = this.systemInformationFormService.updateObjFromForm(this.form, compressedAirAssessment.systemInformation);
    compressedAirAssessment.systemInformation = systemInformation;
    //TODO: double check other types
    if (systemInformation.multiCompressorSystemControls == 'cascading' || systemInformation.multiCompressorSystemControls == 'baseTrim') {
      let numberOfHourIntervals: number = compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;
      compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
        compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingCascading(compressedAirAssessment.systemProfile.profileSummary, dayType, numberOfHourIntervals);
      })
    } if (systemInformation.multiCompressorSystemControls == 'isentropicEfficiency') {
      let numberOfHourIntervals: number = compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;
      compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
        compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingIsentropicEfficiency(compressedAirAssessment.systemProfile.profileSummary, dayType, numberOfHourIntervals, compressedAirAssessment.compressorInventoryItems, this.settings, systemInformation);
      })
    } else if (systemInformation.multiCompressorSystemControls == 'targetPressureSequencer' && compressedAirAssessment.modifications) {
      //if sequencer on baseline cannot have these modifications. Turn off
      compressedAirAssessment.modifications.forEach(modification => {
        modification.reduceSystemAirPressure.order = 100;
        modification.adjustCascadingSetPoints.order = 100;
        modification.reduceRuntime.order = 100;
      });
    }


    if (compressedAirAssessment.modifications && (systemInformation.multiCompressorSystemControls != 'targetPressureSequencer' || systemInformation.multiCompressorSystemControls != 'targetPressureSequencer')) {
      //if not sequencer or cascading on baseline cannot have these modifications. Turn off
      compressedAirAssessment.modifications.forEach(modification => {
        modification.useAutomaticSequencer.order = 100;
        modification.adjustCascadingSetPoints.order = 100;
      });
    }
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
  }

  changeMaxPlantPressure() {
    this.form = this.systemInformationFormService.setSequencerFieldValidators(this.form);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let systemInformation: SystemInformation = this.systemInformationFormService.updateObjFromForm(this.form, compressedAirAssessment.systemInformation);
    compressedAirAssessment.systemInformation = systemInformation;
    let numberOfHourIntervals: number = compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;
    compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
      compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingIsentropicEfficiency(compressedAirAssessment.systemProfile.profileSummary, dayType, numberOfHourIntervals, compressedAirAssessment.compressorInventoryItems, this.settings, systemInformation);
    });
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
  }



  changeTargetPressure() {
    this.form = this.systemInformationFormService.setSequencerFieldValidators(this.form);
    this.save()
  }


  toggleAtmosphericPressureKnown() {
    this.form.controls.atmosphericPressureKnown.patchValue(!this.form.controls.atmosphericPressureKnown.value);
    this.save();
  }

  setAtmosphericPressure() {
    let atmosphericPressure: number = this.altitudeCorrectionService.calculatePressureGivenAltitude(this.form.controls.systemElevation.value, this.settings);
    atmosphericPressure = Number(atmosphericPressure.toFixed(2));
    this.form.controls.atmosphericPressure.patchValue(atmosphericPressure);
    this.save();
  }

  setCo2SavingsData(compressedAirAssessment: CompressedAirAssessment) {

    let co2SavingsData: Co2SavingsData;

    if (compressedAirAssessment.systemInformation.co2SavingsData) {
      co2SavingsData = compressedAirAssessment.systemInformation.co2SavingsData;
    }
    else {
      co2SavingsData = this.assessmentCo2SavingsService.getCo2SavingsDataFromSettingsObject(this.settings);
    }

    this.co2SavingsData = co2SavingsData;
    this.save(co2SavingsData);
  }
}
