import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { CompressedAirAssessment, CompressedAirDayType, CompressorInventoryItem, ProfileSummary, ProfileSummaryData, ReduceRuntime, SystemProfile } from '../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';

@Component({
  selector: 'app-reduce-run-time',
  templateUrl: './reduce-run-time.component.html',
  styleUrls: ['./reduce-run-time.component.css']
})
export class ReduceRunTimeComponent implements OnInit {

  selectedModificationIdSub: Subscription;
  reduceRuntime: ReduceRuntime
  isFormChange: boolean = false;
  selectedDayTypeId: string;
  dayTypeOptions: Array<CompressedAirDayType>;
  requiredAirflow: Array<number>;
  availableAirflow: Array<number>;
  inventoryItems: Array<CompressorInventoryItem>;
  profileSummary: Array<ProfileSummary>
  hasError: boolean;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService) { }

  ngOnInit(): void {
    this.selectedModificationIdSub = this.compressedAirAssessmentService.selectedModificationId.subscribe(val => {
      if (val && !this.isFormChange) {
        let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
        this.dayTypeOptions = compressedAirAssessment.compressedAirDayTypes;
        this.inventoryItems = compressedAirAssessment.compressorInventoryItems;
        this.profileSummary = compressedAirAssessment.systemProfile.profileSummary;
        this.selectedDayTypeId = this.dayTypeOptions[0].dayTypeId;
        let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == val });
        this.reduceRuntime = compressedAirAssessment.modifications[modificationIndex].reduceRuntime;
        this.setAirflowData();
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
  setReduceRunTime() {
    this.save();
  }

  save() {
    this.isFormChange = true;
    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
    let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == selectedModificationId });
    compressedAirAssessment.modifications[modificationIndex].reduceRuntime = this.reduceRuntime;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
    this.setAirflowData();
  }

  setAirflowData() {
    this.requiredAirflow = new Array();
    this.availableAirflow = new Array();
    for (let i = 0; i < 24; i++) {
      this.requiredAirflow.push(0);
      this.availableAirflow.push(0);
    }
    this.profileSummary.forEach(summary => {
      if (summary.dayTypeId == this.selectedDayTypeId) {
        for (let i = 0; i < 24; i++) {
          if (summary.profileSummaryData[i].order != 0) {
            this.requiredAirflow[i] = this.requiredAirflow[i] + summary.profileSummaryData[i].airflow;
          }
          let runTimeData = this.reduceRuntime.runtimeData.find(data => { return data.compressorId == summary.compressorId && data.dayTypeId == this.selectedDayTypeId });
          if (runTimeData.intervalData[i].isCompressorOn) {
            this.availableAirflow[i] = this.availableAirflow[i] + runTimeData.fullLoadCapacity;
          }
        }
      }
    });
    this.hasError = false;
    for(let i = 0; i < this.requiredAirflow.length; i++){
      if(this.availableAirflow[i] < this.requiredAirflow[i]){
        this.hasError = true;
      }
    }
  }
}