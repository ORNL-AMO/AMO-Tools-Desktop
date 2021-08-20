import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, ImproveEndUseEfficiency } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
  selector: 'app-improve-end-use-efficiency',
  templateUrl: './improve-end-use-efficiency.component.html',
  styleUrls: ['./improve-end-use-efficiency.component.css']
})
export class ImproveEndUseEfficiencyComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  improveEndUseEfficiency: ImproveEndUseEfficiency;
  isFormChange: boolean = false;
  hourIntervals: Array<number>;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.setHourIntervals();
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.improveEndUseEfficiency = compressedAirAssessment.modifications[modificationIndex].improveEndUseEfficiency;
      } else {
        this.isFormChange = false;
      }
    });
  }

  ngOnDestroy() {
    this.selectedModificationIdSub.unsubscribe();
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }
  setImproveEndUseEfficiency() {
    this.save();
  }

  save() {
    this.isFormChange = true;
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
    let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == selectedModificationId });
    compressedAirAssessment.modifications[modificationIndex].improveEndUseEfficiency = this.improveEndUseEfficiency;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }

  setReductionType(str: "Fixed" | "Variable") {
    this.improveEndUseEfficiency.reductionType = str;
    this.save();
  }

  setHourIntervals() {
    this.hourIntervals = new Array();
    for (let i = 0; i < 24; i++) {
      this.hourIntervals.push(i);
    }
  }

  toggleAll() {
    let toggleValue: boolean = !this.improveEndUseEfficiency.reductionData[0].data[0].applyReduction;
    for (let i = 0; i < this.improveEndUseEfficiency.reductionData.length; i++) {
      for (let dataIndex = 0; dataIndex < this.improveEndUseEfficiency.reductionData[i].data.length; dataIndex++) {
        this.improveEndUseEfficiency.reductionData[i].data[dataIndex].applyReduction = toggleValue;
      }
    }
    this.save();
  }

  trackByIdx(index: number, obj: any): any {
    return index;
  }
}
