import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { EndUse } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { EndUsesService } from '../end-uses.service';
import { EndUseFormService } from './end-use-form.service';

@Component({
  selector: 'app-end-use-form',
  templateUrl: './end-use-form.component.html',
  styleUrls: ['./end-use-form.component.css']
})
export class EndUseFormComponent implements OnInit {
  settings: Settings;
  selectedEndUseSubscription: Subscription;
  
  form: FormGroup;
  isFormChange: boolean = false;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, 
    private endUseFormService: EndUseFormService,
    private endUsesService: EndUsesService) { }

  ngOnInit(): void {
    this.selectedEndUseSubscription = this.endUsesService.selectedEndUse.subscribe(selectedEndUse => {
      if (selectedEndUse) {
        if (this.isFormChange == false) {
          // this.form = this.endUseFormService.getEndUseFormFromObj(selectedEndUse);
        } else {
          this.isFormChange = false;
        }
      }
    });
    this.settings = this.compressedAirAssessmentService.settings.getValue();
  }

  ngOnDestroy() {
    this.selectedEndUseSubscription.unsubscribe();
  }

  save() {
    this.isFormChange = true;
    let selectedEndUse: EndUse = this.endUsesService.selectedEndUse.getValue();
    // TODO can just use parent component for whole of form
    // let updatedEndUse = this.endUseFormService.getEndUseFromFrom(this.form, selectedEndUse);
    // this.endUsesService.updateEndUseInformation(updatedEndUse);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }
  

}
