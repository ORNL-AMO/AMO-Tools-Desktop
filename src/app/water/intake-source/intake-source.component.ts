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
  componentFormTitle: string;
  waterAssessment: WaterAssessment;
  selectedIntakeSource: IntakeSource;
  form: FormGroup;
  selectedComponentSub: Subscription;
  constructor(private waterAssessmentService: WaterAssessmentService, private waterProcessComponentService: WaterProcessComponentService) {}

  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    this.componentFormTitle = this.waterAssessmentService.setWaterProcessComponentTitle('water-intake');

    this.selectedComponentSub = this.waterProcessComponentService.selectedComponent.subscribe(selectedComponent => {
      this.selectedIntakeSource = selectedComponent as IntakeSource;
      this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
      this.waterProcessComponentService.selectedViewComponents.next(this.waterAssessment.intakeSources);
      if (this.selectedIntakeSource) {
        this.initForm();
      }
    });
    this.setDefaultSelectedComponent();
  }

  ngOnDestroy() {
    this.selectedComponentSub.unsubscribe();
  }

  setDefaultSelectedComponent() {
    if (!this.selectedIntakeSource || (this.selectedIntakeSource && this.selectedIntakeSource.processComponentType !== 'water-intake')) {
      let lastModified: WaterProcessComponent = _.maxBy(this.waterAssessment.intakeSources, 'modifiedDate');
      this.waterProcessComponentService.selectedComponent.next(lastModified);
    }
  }

  initForm() {
   this.form = this.waterProcessComponentService.getIntakeSourceForm(this.selectedIntakeSource);
  }

  save() {
    let updated: IntakeSource = this.waterProcessComponentService.getIntakeSourceFromForm(this.form, this.selectedIntakeSource);
    let updateIndex: number = this.waterAssessment.intakeSources.findIndex(intake => intake.diagramNodeId === updated.diagramNodeId);
    this.waterAssessment.intakeSources[updateIndex] = updated;
    this.waterAssessmentService.waterAssessment.next(this.waterAssessment);
  }

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  addIntakeSource() {
    this.waterAssessmentService.addNewWaterComponent('water-intake')
  }
}
