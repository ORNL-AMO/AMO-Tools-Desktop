import { Component } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { WaterAssessmentService } from '../water-assessment.service';
import { IntakeSource, WaterAssessment, WaterProcessComponent } from '../../shared/models/water-assessment';
import { WaterProcessComponentService } from '../water-system-component.service';
import * as _ from 'lodash';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-intake-source',
  templateUrl: './intake-source.component.html',
  styleUrl: './intake-source.component.css'
})
export class IntakeSourceComponent {
  settings: Settings;
  intakeSources: IntakeSource[];
  selectedIntakeSource: IntakeSource;
  form: FormGroup;
  selectedComponentSub: Subscription;
  constructor(private waterAssessmentService: WaterAssessmentService, private waterProcessComponentService: WaterProcessComponentService) {}

  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    let waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    this.intakeSources = waterAssessment.intakeSources;
    this.setSelectedComponent();
    if (this.intakeSources) {
      this.waterProcessComponentService.selectedViewComponents.next(this.intakeSources);
    }

    this.selectedComponentSub = this.waterProcessComponentService.selectedComponent.subscribe(val => {
      this.selectedIntakeSource = val;
      console.log('intake selectedIntakeSource', this.selectedIntakeSource)
      this.initForm();
    });
    
  }

  ngOnDestroy() {
    this.selectedComponentSub.unsubscribe();
  }

  setSelectedComponent() {
    let selectedComponent: WaterProcessComponent = this.waterProcessComponentService.selectedComponent.getValue();
    if (!selectedComponent || (selectedComponent && selectedComponent.processComponentType !== 'waterIntake')) {
      let lastModified: WaterProcessComponent = _.maxBy(this.intakeSources, 'modifiedDate');
      this.waterProcessComponentService.selectedComponent.next(lastModified);
    }
  }

  initForm() {
   this.form = this.waterProcessComponentService.getIntakeFormFromSource(this.selectedIntakeSource);
  }

  save() {
    let updated: IntakeSource = this.waterProcessComponentService.getIntakeSourceFromForm(this.form, this.selectedIntakeSource);
    let waterAssessment: WaterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    let updateIndex: number = waterAssessment.intakeSources.findIndex(intake => intake.diagramNodeId === updated.diagramNodeId);
    waterAssessment.intakeSources[updateIndex] = updated;
    this.waterAssessmentService.waterAssessment.next(waterAssessment);
  }

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  addIntakeSource() {}

}
