import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { BoilerWater } from '../../../shared/models/water-assessment';
import { Settings } from '../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { WaterAssessmentService } from '../../water-assessment.service';
import { WaterUsingSystemService } from '../water-using-system.service';

@Component({
  selector: 'app-boiler-water',
  templateUrl: './boiler-water.component.html',
  styleUrl: './boiler-water.component.css'
})
export class BoilerWaterComponent {
  @Input()
  boilerWater: BoilerWater;
  @Output()
  updateBoilerWater = new EventEmitter<BoilerWater>();

  settings: Settings;
  form: FormGroup;
  smallScreenTab: string = 'form';
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
    this.form = this.waterUsingSystemService.getBoilerWaterForm(this.boilerWater);
  }
  
  save() {
    let boilerWater = this.waterUsingSystemService.getBoilerWaterFromForm(this.form);
    this.updateBoilerWater.emit(boilerWater);
  }
  
  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  setOpHoursModalWidth() {
    if (this.formElement && this.formElement.nativeElement.clientWidth) {
      this.formWidth = this.formElement.nativeElement.clientWidth;
    }
  }

  setSmallScreenTab(selectedTab: string) {
    this.smallScreenTab = selectedTab;
  }
}

