import { Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { WaterAssessment, WaterProcessComponent, WaterSystemResults, WaterUsingSystem } from '../../../shared/models/water-assessment';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { WaterAssessmentService } from '../../water-assessment.service';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';
import { WaterSystemComponentService } from '../../water-system-component.service';
import { WaterUsingSystemService } from '../water-using-system.service';
import { copyObject } from '../../../shared/helperFunctions';
import { waterUsingSystemTypeOptions } from '../../waterConstants';
import { OperatingHours } from '../../../shared/models/operations';

@Component({
  selector: 'app-water-system-data',
  templateUrl: './water-system-data.component.html',
  styleUrl: './water-system-data.component.css'
})
export class WaterSystemDataComponent {
  selectedWaterUsingSystem: WaterUsingSystem;
  selectedSystemType: number;
  waterAssessment: WaterAssessment;
  settings: Settings;
  componentFormTitle: string;
  form: FormGroup;
  selectedComponentSub: Subscription;

  isCollapsed: Record<WaterSystemGroupString, boolean> = {
    waterFlows: false,
    waterSources: false,
    motorEnergy: true,
    processUse: true
  };
  systemTypeOptions: {value: number, display: string}[];
  showWaterSystemDataModal: boolean = false;
  showOperatingHoursModal: boolean = false;

  waterSystemResults: WaterSystemResults;
  waterUsingSystemTabSub: Subscription;
  waterUsingSystemTab: string;
  
  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }
  formWidth: number;
  
  constructor(private waterAssessmentService: WaterAssessmentService, 
    private waterAssessmentResultsService: WaterAssessmentResultsService,
    private waterSystemComponentService: WaterSystemComponentService,
    private waterUsingSystemService: WaterUsingSystemService
  ) {}

  ngOnInit() {
    this.systemTypeOptions = copyObject(waterUsingSystemTypeOptions);
    this.settings = this.waterAssessmentService.settings.getValue();
    
    this.selectedComponentSub = this.waterSystemComponentService.selectedComponent.subscribe(selectedComponent => {
      this.selectedWaterUsingSystem = selectedComponent as WaterUsingSystem;
      this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
      this.waterSystemComponentService.selectedViewComponents.next(this.waterAssessment.waterUsingSystems as WaterProcessComponent[]);
      if (this.selectedWaterUsingSystem) {
        this.initForm();
        this.setSystemType();
      }
    });

    this.waterUsingSystemTabSub = this.waterAssessmentService.waterUsingSystemTab.subscribe(val => {
      this.waterUsingSystemTab = val;
    });

    this.setDefaultSelectedComponent();
  }

  ngOnDestroy() {
    this.selectedComponentSub.unsubscribe();
    this.waterUsingSystemTabSub.unsubscribe();
  }

  setDefaultSelectedComponent() {
    this.waterSystemComponentService.setDefaultSelectedComponent(this.waterAssessment.waterUsingSystems, this.selectedWaterUsingSystem, 'water-using-system')
  }

  initForm() {
   this.form = this.waterUsingSystemService.getWaterUsingSystemForm(this.selectedWaterUsingSystem);
  }

  /**
 * Update selectedWaterUsingSystem in water assessment
 * @param updatedWaterUsingSystem Pass when sub-form (ProcessUse, MotorEnergy, etc) updates system data.
 */
  save(updatedWaterUsingSystem?: WaterUsingSystem) {
    if (!updatedWaterUsingSystem) {
      updatedWaterUsingSystem = this.waterUsingSystemService.getWaterUsingSystemFromForm(this.form, this.selectedWaterUsingSystem);
    }
    let updateIndex: number = this.waterAssessment.waterUsingSystems.findIndex(system => system.diagramNodeId === updatedWaterUsingSystem.diagramNodeId);
    this.waterAssessment.waterUsingSystems[updateIndex] = updatedWaterUsingSystem;
    this.waterAssessmentService.waterAssessment.next(this.waterAssessment);
    this.waterSystemResults = this.waterAssessmentResultsService.getWaterSystemResults(updatedWaterUsingSystem);
  }

  saveWaterSystemData(selectedWaterUsingSystem: WaterUsingSystem) {
    this.save(selectedWaterUsingSystem);
  }

  toggleCollapse(group: WaterSystemGroupString) {
    this.isCollapsed[group] = !this.isCollapsed[group];
  }
  
  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  setSystemType() {
    this.selectedSystemType = this.form.controls.systemType.value;
  }

  openWaterSystemDataModal() {
    this.showWaterSystemDataModal = true;
    this.waterAssessmentService.modalOpen.next(this.showWaterSystemDataModal);
  }

  closeWaterSystemDataModal() {
    this.showWaterSystemDataModal = false;
    this.waterAssessmentService.modalOpen.next(this.showWaterSystemDataModal)
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.waterUsingSystemService.operatingHours = oppHours;
    this.form.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.save();
    this.closeOperatingHoursModal();
  }

  
  setOpHoursModalWidth() {
    if (this.formElement && this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }


}

type WaterSystemGroupString = 'waterFlows' | 'waterSources' | 'motorEnergy' | 'processUse';
