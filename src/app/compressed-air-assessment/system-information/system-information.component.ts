import { ViewChild } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { AltitudeCorrectionService } from '../../calculator/utilities/altitude-correction/altitude-correction.service';
import { Co2SavingsData } from '../../calculator/utilities/co2-savings/co2-savings.service';
import { AssessmentCo2SavingsService } from '../../shared/assessment-co2-savings/assessment-co2-savings.service';
import { CompressedAirAssessment, SystemInformation } from '../../shared/models/compressed-air-assessment';
import { Settings } from '../../shared/models/settings';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { SystemProfileService } from '../system-profile/system-profile.service';
import { SystemInformationFormService } from './system-information-form.service';

@Component({
  selector: 'app-system-information',
  templateUrl: './system-information.component.html',
  styleUrls: ['./system-information.component.css']
})
export class SystemInformationComponent implements OnInit {
  settings: Settings;
  @ViewChild('systemCapacityModal', { static: false }) public systemCapacityModal: ModalDirective;
  showSystemCapacityModal: boolean = false;
  form: FormGroup;
  co2SavingsData: Co2SavingsData;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private assessmentCo2SavingsService: AssessmentCo2SavingsService,
    private systemInformationFormService: SystemInformationFormService, private systemProfileService: SystemProfileService,
    private altitudeCorrectionService: AltitudeCorrectionService) { }

  ngOnInit(): void {
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.setCo2SavingsData(compressedAirAssessment);
    this.form = this.systemInformationFormService.getFormFromObj(compressedAirAssessment.systemInformation, this.settings);
  }

  save(co2SavingsData?: Co2SavingsData) {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let systemInformation: SystemInformation = this.systemInformationFormService.getObjFromForm(this.form);
    if (co2SavingsData) {
      systemInformation.co2SavingsData = co2SavingsData;
    }
    compressedAirAssessment.systemInformation = systemInformation;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment, true);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  openSystemCapacityModal() {
    this.compressedAirAssessmentService.modalOpen.next(true);
    this.showSystemCapacityModal = true;
  }

  closeSystemCapacityModal(totalCapacityOfCompressedAirSystem?: number) {
    if (totalCapacityOfCompressedAirSystem) {
      this.form.patchValue({
        totalAirStorage: totalCapacityOfCompressedAirSystem
      });
    }
    this.compressedAirAssessmentService.modalOpen.next(false);
    this.showSystemCapacityModal = false;
    this.save();
  }

  changeIsSequencerUsed() {
    this.form = this.systemInformationFormService.setSequencerFieldValidators(this.form);
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let systemInformation: SystemInformation = this.systemInformationFormService.getObjFromForm(this.form);
    compressedAirAssessment.systemInformation = systemInformation;
    if (!systemInformation.isSequencerUsed) {
      let numberOfHourIntervals: number = compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours / compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval;
      compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
        compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingNoSequencer(compressedAirAssessment.systemProfile.profileSummary, dayType, numberOfHourIntervals);
      })
    } else if (systemInformation.isSequencerUsed && compressedAirAssessment.modifications) {
      //if sequencer on baseline cannot have these modifications. Turn off
      compressedAirAssessment.modifications.forEach(modification => {
        modification.reduceSystemAirPressure.order = 100;
        modification.adjustCascadingSetPoints.order = 100;
        modification.reduceRuntime.order = 100;
      });
    }
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
    if (compressedAirAssessment.systemInformation.co2SavingsData) {
      this.co2SavingsData = compressedAirAssessment.systemInformation.co2SavingsData;
    } else {
      let co2SavingsData: Co2SavingsData = this.assessmentCo2SavingsService.getCo2SavingsDataFromSettingsObject(this.settings);
      this.co2SavingsData = co2SavingsData;
    }
  }
}
