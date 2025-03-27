import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { OperatingHours } from '../../../../shared/models/operations';
import { WaterAssessmentService } from '../../../water-assessment.service';
import { WaterUsingSystemService } from '../../water-using-system.service';
import { Landscaping } from '../../../../../process-flow-types/shared-process-flow-types';

@Component({
  selector: 'app-landscaping',
  templateUrl: './landscaping.component.html',
  styleUrl: './landscaping.component.css'
})
export class LandscapingComponent {
  @Input()
  landscaping: Landscaping;
  @Output()
  updateLandscaping = new EventEmitter<Landscaping>();

  settings: Settings;
  form: FormGroup;
  operatingHours: OperatingHours;
  smallScreenTab: string = 'form';
  showOperatingHoursModal: boolean = false;
  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.setOpHoursModalWidth();
  }

  @ViewChild('formElement', { static: false }) formElement: ElementRef;
  formWidth: number;


  constructor(private waterUsingSystemService: WaterUsingSystemService,
    private waterAssessmentService: WaterAssessmentService,
  ) { }


  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    this.initForm();
    this.save();
  }
  
  ngOnDestroy() {}
  
  initForm() {
    this.form = this.waterUsingSystemService.getLandscapingForm(this.landscaping);
  }
  
  save() {
    let landscaping = this.waterUsingSystemService.getLandscapingFromForm(this.form);
    this.updateLandscaping.emit(landscaping);
  }
  
  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  setOpHoursModalWidth() {
    if (this.formElement && this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  closeOperatingHoursModal() {
    this.showOperatingHoursModal = false;
  }

  openOperatingHoursModal() {
    this.showOperatingHoursModal = true;
  }

  updateOperatingHours(oppHours: OperatingHours) {
    this.operatingHours = oppHours;
    this.form.controls.hoursPerYear.patchValue(oppHours.hoursPerYear);
    this.save();
    this.closeOperatingHoursModal();
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}

