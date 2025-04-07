import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FormGroup } from '@angular/forms';
import { OperatingHours } from '../../../../shared/models/operations';
import { WaterUsingSystemService } from '../../water-using-system.service';
import { WaterAssessmentService } from '../../../water-assessment.service';
import { CoolingTower } from 'process-flow-lib';

@Component({
  selector: 'app-cooling-tower',
  templateUrl: './cooling-tower.component.html',
  styleUrl: './cooling-tower.component.css'
})
export class CoolingTowerComponent {
  @Input()
  coolingTower: CoolingTower;
  @Output()
  updateCoolingTower = new EventEmitter<CoolingTower>();

  settings: Settings;
  form: FormGroup;
  smallScreenTab: string = 'form';
  conductivityUnit: string;
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
    this.conductivityUnit = this.waterAssessmentService.waterAssessment.getValue().systemBasics.conductivityUnit;

    this.initForm();
    this.save();
  }
  
  ngOnDestroy() {}
  
  initForm() {
    this.form = this.waterUsingSystemService.getCoolingTowerForm(this.coolingTower);
  }
  
  save() {
    let coolingTower = this.waterUsingSystemService.getCoolingTowerFromForm(this.form);
    this.updateCoolingTower.emit(coolingTower);
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

