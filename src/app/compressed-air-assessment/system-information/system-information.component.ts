import { Input, ViewChild } from '@angular/core';
import { ChangeDetectorRef } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ModalDirective } from 'ngx-bootstrap';
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
  @Input()
  settings: Settings;
  @ViewChild('systemCapacityModal', { static: false }) public systemCapacityModal: ModalDirective;

  showSystemCapacityModal: boolean = false;
  form: FormGroup;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private systemInformationFormService: SystemInformationFormService, private systemProfileService: SystemProfileService) { }

  ngOnInit(): void {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.form = this.systemInformationFormService.getFormFromObj(compressedAirAssessment.systemInformation);
  }

  save() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let systemInformation: SystemInformation = this.systemInformationFormService.getObjFromForm(this.form);
    compressedAirAssessment.systemInformation = systemInformation;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
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
  
  changeIsSequencerUsed(){
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let systemInformation: SystemInformation = this.systemInformationFormService.getObjFromForm(this.form);
    compressedAirAssessment.systemInformation = systemInformation;
    if(!systemInformation.isSequencerUsed){
      compressedAirAssessment.compressedAirDayTypes.forEach(dayType => {
        compressedAirAssessment.systemProfile.profileSummary = this.systemProfileService.updateCompressorOrderingNoSequencer(compressedAirAssessment.systemProfile.profileSummary, dayType);
      })
    }
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }
}
