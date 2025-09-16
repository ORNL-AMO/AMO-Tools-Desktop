import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { OperatingHours } from '../../../../shared/models/operations';
import { WaterAssessmentService } from '../../../water-assessment.service';
import { WaterUsingSystemService } from '../../water-using-system.service';
import { KitchenRestroom } from 'process-flow-lib';

@Component({
  selector: 'app-kitchen-restroom',
  standalone: false,
  templateUrl: './kitchen-restroom.component.html',
  styleUrl: './kitchen-restroom.component.css'
})
export class KitchenRestroomComponent {
  @Input()
  kitchenRestroom: KitchenRestroom;
  @Output()
  updateKitchenRestroom = new EventEmitter<KitchenRestroom>();

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
    this.form = this.waterUsingSystemService.getKitchenRestroomForm(this.kitchenRestroom);
  }
  
  save() {
    let kitchenRestroom = this.waterUsingSystemService.getKitchenRestroomFromForm(this.form);
    this.updateKitchenRestroom.emit(kitchenRestroom);
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

