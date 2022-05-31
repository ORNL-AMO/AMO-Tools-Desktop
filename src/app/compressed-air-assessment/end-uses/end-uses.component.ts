import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, EndUse } from '../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../compressed-air-assessment.service';
import { EndUsesService } from './end-uses.service';
import * as _ from 'lodash';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-end-uses',
  templateUrl: './end-uses.component.html',
  styleUrls: ['./end-uses.component.css']
})
export class EndUsesComponent implements OnInit {
  hasEndUses: boolean;
  form: FormGroup;
  isFormChange: boolean = false;
  selectedEndUseSubscription: Subscription;
  selectedEndUse: EndUse;
  settings: Settings;

  selectedDayType: CompressedAirDayType;
  dayTypeOptions: Array<CompressedAirDayType>;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private endUsesService: EndUsesService) { }

  ngOnInit(): void {
    this.initializeEndUses();
    this.settings = this.compressedAirAssessmentService.settings.getValue();
    this.selectedEndUseSubscription = this.endUsesService.selectedEndUse.subscribe(selectedEndUse => {
      if (selectedEndUse) {
        this.selectedEndUse = selectedEndUse;
        this.hasEndUses = true;
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        // INIT select with selected day type?
        this.dayTypeOptions = compressedAirAssessment.compressedAirDayTypes;
        if (this.isFormChange == false) {
          this.form = this.endUsesService.getEndUseFormFromObj(selectedEndUse);
        } else {
          this.isFormChange = false;
        }
      } else {
        this.hasEndUses = false;
      }
    });
  }

  ngOnDestroy() {
    this.selectedEndUseSubscription.unsubscribe();
  }

  save() {
    this.isFormChange = true;
    let updatedEndUse = this.endUsesService.getEndUseFromFrom(this.form);
    this.endUsesService.updateEndUseInformation(updatedEndUse);
  }

  initializeEndUses() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    this.hasEndUses = compressedAirAssessment.endUses.length != 0;
    if (this.hasEndUses) {
      // check has valid?
      let selectedEndUse: EndUse = this.endUsesService.selectedEndUse.getValue();
      if (selectedEndUse) {
        // let endUses: Array<EndUse> = this.endUsesService.endUses.getValue();
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        let endUseExists: EndUse = compressedAirAssessment.endUses.find(endUse => { return endUse.endUseId == selectedEndUse.endUseId });
        if (!endUseExists) {
          this.setLastUsedEndUse(compressedAirAssessment);
        }
      } else {
        this.setLastUsedEndUse(compressedAirAssessment);
      }
    }
  }

  setLastUsedEndUse(compressedAirAssessment: CompressedAirAssessment) {
    let lastItemModified: EndUse = _.maxBy(compressedAirAssessment.endUses, 'modifiedDate');
    this.endUsesService.selectedEndUse.next(lastItemModified);
  }

  addEndUse() {
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let result = this.endUsesService.addToAssessment(compressedAirAssessment);
    this.compressedAirAssessmentService.updateCompressedAir(result.compressedAirAssessment, true);
    this.endUsesService.selectedEndUse.next(result.newEndUse);
    this.hasEndUses = true;
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }
}
