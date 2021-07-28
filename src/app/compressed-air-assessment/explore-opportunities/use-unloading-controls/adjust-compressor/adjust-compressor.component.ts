import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AdjustedUnloadingCompressor, CompressedAirAssessment, CompressorInventoryItem } from '../../../../shared/models/compressed-air-assessment';
import { CompressedAirAssessmentService } from '../../../compressed-air-assessment.service';
import { InventoryService } from '../../../inventory/inventory.service';
import { ControlTypes } from '../../../inventory/inventoryOptions';
import { PerformancePointCalculationsService } from '../../../inventory/performance-points/calculations/performance-point-calculations.service';
import { PerformancePointsFormService } from '../../../inventory/performance-points/performance-points-form.service';

@Component({
  selector: 'app-adjust-compressor',
  templateUrl: './adjust-compressor.component.html',
  styleUrls: ['./adjust-compressor.component.css']
})
export class AdjustCompressorComponent implements OnInit {
  @Input()
  inventoryItems: Array<CompressorInventoryItem>;
  @Input()
  adjustedCompressor: AdjustedUnloadingCompressor;

  controlTypeOptions: Array<{ value: number, label: string, compressorTypes: Array<number> }>;

  showMaxFullFlow: boolean;
  showUnload: boolean;
  showNoLoad: boolean;
  showBlowoff: boolean;
  selectedCompressor: CompressorInventoryItem;
  selectedCompressorSub: Subscription;
  constructor(private compressedAirAssessmentService: CompressedAirAssessmentService, private performancePointsFormService: PerformancePointsFormService,
    private inventoryService: InventoryService, private performancePointCalculationsService: PerformancePointCalculationsService) { }

  ngOnInit(): void {
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(val => {
      if (val) {
        this.selectedCompressor = val;
        this.setControlTypeOptions();
        this.setShowPoints();
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
  }


  ngOnChanges(){
    this.setControlTypeOptions();
    this.setShowPoints();
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  save() {
    //update forms
    this.selectedCompressor.compressorControls.controlType = this.adjustedCompressor.controlType;
    this.selectedCompressor.compressorControls.unloadPointCapacity = this.adjustedCompressor.unloadPointCapacity;
    this.selectedCompressor.compressorControls.automaticShutdown = this.adjustedCompressor.automaticShutdown;
    this.selectedCompressor.performancePoints = this.performancePointCalculationsService.updatePerformancePoints(this.selectedCompressor);
    this.inventoryService.selectedCompressor.next(this.selectedCompressor);

    let compressedAirAssessment: CompressedAirAssessment = this.compressedAirAssessmentService.compressedAirAssessment.getValue();
    let selectedModificationId: string = this.compressedAirAssessmentService.selectedModificationId.getValue();
    let modificationIndex: number = compressedAirAssessment.modifications.findIndex(mod => { return mod.modificationId == selectedModificationId });
    let adjustedCompressorIndex: number = compressedAirAssessment.modifications[modificationIndex].useUnloadingControls.adjustedCompressors.findIndex(compressor => { return compressor.compressorId == this.adjustedCompressor.compressorId });
    compressedAirAssessment.modifications[modificationIndex].useUnloadingControls.adjustedCompressors[adjustedCompressorIndex] = this.adjustedCompressor;
    this.compressedAirAssessmentService.updateCompressedAir(compressedAirAssessment);
  }

  setControlTypeOptions() {
    if (this.adjustedCompressor.originalControlType == 1) {
      //inlet modulation without unloading
      //potential selections = Inlet Mod with unloading, Start/Stop
      this.controlTypeOptions = ControlTypes.filter(type => { return type.value == 2 || type.value == 5 || type.value == this.adjustedCompressor.originalControlType });
    } else if (this.adjustedCompressor.originalControlType == 2 || this.adjustedCompressor.originalControlType == 4 || this.adjustedCompressor.originalControlType == 3) {
      //inlet mod w/ unloading, load/unload, Variable displacement
      //potential selections = Start/Stop
      this.controlTypeOptions = ControlTypes.filter(type => { return type.value == 5 || type.value == this.adjustedCompressor.originalControlType });
    } else if (this.adjustedCompressor.originalControlType == 5) {
      //Start/Stop
      //potential selections = Load/Unload
      this.controlTypeOptions = ControlTypes.filter(type => { return type.value == 4 || type.value == this.adjustedCompressor.originalControlType });
    } else if (this.adjustedCompressor.originalControlType == 7 || this.adjustedCompressor.originalControlType == 9) {
      //inlet butterfly mod with blowoff, inlet guide vane mod with blowoff
      //potential selections = inlet butterfly mod with unloading
      this.controlTypeOptions = ControlTypes.filter(type => { return type.value == 8 || type.value == this.adjustedCompressor.originalControlType });
    } else if (this.adjustedCompressor.originalControlType == 8) {
      //inlet butterfly mod with unloading
      //potential selections = inlet butterfly mod with blowoff
      this.controlTypeOptions = ControlTypes.filter(type => { return type.value == 7 || type.value == this.adjustedCompressor.originalControlType });
    } else if (this.adjustedCompressor.originalControlType == 9) {
      //inlet butterfly mod with unloading
      //potential selections = inlet butterfly mod with blowoff
      this.controlTypeOptions = ControlTypes.filter(type => { return type.value == 10 || type.value == this.adjustedCompressor.originalControlType });
    } else if (this.adjustedCompressor.originalControlType == 10) {
      //Inlet guide vane modulation with unloading
      //potential selections = inlet butterfly mod with unloading, inlet guide vane with blowoff
      this.controlTypeOptions = ControlTypes.filter(type => { return type.value == 9 || type.value == 8 || type.value == this.adjustedCompressor.originalControlType });
    }
  }

  setShowPoints() {
    this.setShowMaxFlow();
    this.setShowUnload();
    this.setShowNoLoad();
    this.setShowBlowoff();
  }


  setShowMaxFlow() {
    this.showMaxFullFlow = this.performancePointsFormService.checkShowMaxFlowPerformancePoint(this.adjustedCompressor.compressorType, this.adjustedCompressor.controlType);
  }

  setShowUnload() {
    this.showUnload = this.performancePointsFormService.checkShowUnloadPerformancePoint(this.adjustedCompressor.compressorType, this.adjustedCompressor.controlType);
  }

  setShowNoLoad() {
    this.showNoLoad = this.performancePointsFormService.checkShowNoLoadPerformancePoint(this.adjustedCompressor.compressorType, this.adjustedCompressor.controlType);
  }

  setShowBlowoff() {
    this.showBlowoff = this.performancePointsFormService.checkShowBlowoffPerformancePoint(this.adjustedCompressor.compressorType, this.adjustedCompressor.controlType);
  }

  restoreCompressor() {
    let inventoryCompressor: CompressorInventoryItem = this.inventoryItems.find(item => { return item.itemId == this.adjustedCompressor.compressorId });
    this.adjustedCompressor.controlType = inventoryCompressor.compressorControls.controlType;
    this.adjustedCompressor.unloadPointCapacity = inventoryCompressor.compressorControls.unloadPointCapacity;
    this.adjustedCompressor.performancePoints = inventoryCompressor.performancePoints;
    this.save();
  }
}
