import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { CompressedAirAssessment, SystemInformation } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { SystemInformationFormService } from './system-information-form.service';

@Component({
  selector: 'app-system-information',
  templateUrl: './system-information.component.html',
  styleUrls: ['./system-information.component.css']
})
export class SystemInformationComponent implements OnInit {

  form: FormGroup;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService,
    private systemInformationFormService: SystemInformationFormService) { }

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
}
