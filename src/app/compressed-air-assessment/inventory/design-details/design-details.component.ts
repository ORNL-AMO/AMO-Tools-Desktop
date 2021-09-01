import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { DesignDetails } from '../../../shared/models/compressed-air-assessment';
import { Settings } from '../../../shared/models/settings';
import { CompressedAirAssessmentService } from '../../compressed-air-assessment.service';
import { CompressedAirDataManagementService } from '../../compressed-air-data-management.service';
import { CompressorInventoryItemWarnings, InventoryService } from '../inventory.service';
import { PerformancePointsFormService } from '../performance-points/performance-points-form.service';

@Component({
  selector: 'app-design-details',
  templateUrl: './design-details.component.html',
  styleUrls: ['./design-details.component.css']
})
export class DesignDetailsComponent implements OnInit {
  settings: Settings;
  selectedCompressorSub: Subscription;
  form: FormGroup;
  warnings: CompressorInventoryItemWarnings;
  isFormChange: boolean = false;
  displayBlowdownTime: boolean;
  displayModulation: boolean;
  displayNoLoadPowerFM: boolean;
  displayNoLoadPowerUL: boolean;
  displayMaxFullFlow: boolean;
  contentCollapsed: boolean;
  settingsSub: Subscription;
  constructor(private inventoryService: InventoryService, private compressedAirAssessmentService: CompressedAirAssessmentService,
    private performancePointsFormService: PerformancePointsFormService,
    private compressedAirDataManagementService: CompressedAirDataManagementService) { }

  ngOnInit(): void {
    this.contentCollapsed = this.inventoryService.collapseDesignDetails;
    this.settingsSub = this.compressedAirAssessmentService.settings.subscribe(settings => this.settings = settings);
    this.selectedCompressorSub = this.inventoryService.selectedCompressor.subscribe(compressor => {
      if (compressor) {
        this.warnings = this.inventoryService.checkWarnings(compressor);
        if (this.isFormChange == false) {
          this.form = this.inventoryService.getDesignDetailsFormFromObj(compressor.designDetails, compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
          this.setDisplayBlowdownTime(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
          this.setDisplayModulation(compressor.compressorControls.controlType)
          this.setDisplayMaxFullFlow(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
          this.setDisplayNoLoadPowerFM(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
          this.setDisplayNoLoadPowerUL(compressor.nameplateData.compressorType, compressor.compressorControls.controlType);
        } else {
          this.isFormChange = false;
        }
      }
    });
  }

  ngOnDestroy() {
    this.selectedCompressorSub.unsubscribe();
    this.settingsSub.unsubscribe();
    this.inventoryService.collapseDesignDetails = this.contentCollapsed;
  }

  save() {
    this.isFormChange = true;
    let designDetails: DesignDetails = this.inventoryService.getDesignDetailsObjFromForm(this.form);
    this.compressedAirDataManagementService.updateDesignDetails(designDetails, true);
  }

  focusField(str: string) {
    this.compressedAirAssessmentService.focusedField.next(str);
  }

  setDisplayBlowdownTime(compressorType: number, controlType: number) {
    this.displayBlowdownTime = this.inventoryService.checkDisplayBlowdownTime(compressorType, controlType);
  }

  setDisplayModulation(controlType: number) {
    this.displayModulation = this.inventoryService.checkDisplayModulation(controlType);
  }

  setDisplayNoLoadPowerFM(compressorType: number, controlType: number) {
    let showNoLoad: boolean = this.performancePointsFormService.checkShowNoLoadPerformancePoint(compressorType, controlType)
    if (showNoLoad) {
      if (controlType == 1) {
        this.displayNoLoadPowerFM = true;
      } else {
        this.displayNoLoadPowerFM = false;
      }
    } else {
      this.displayNoLoadPowerFM = false;

    }
  }

  setDisplayNoLoadPowerUL(compressorType: number, controlType: number) {
    let showNoLoad: boolean = this.performancePointsFormService.checkShowNoLoadPerformancePoint(compressorType, controlType)
    if (showNoLoad) {
      if (controlType != 1 && controlType != 5) {
        this.displayNoLoadPowerUL = true;
      } else {
        this.displayNoLoadPowerUL = false;
      }
    } else {
      this.displayNoLoadPowerUL = false;
    }
  }

  setDisplayMaxFullFlow(compressorType: number, controlType: number) {
    this.displayMaxFullFlow = this.performancePointsFormService.checkShowMaxFlowPerformancePoint(compressorType, controlType);
  }

  toggleCollapse() {
    this.contentCollapsed = !this.contentCollapsed;
  }
}
