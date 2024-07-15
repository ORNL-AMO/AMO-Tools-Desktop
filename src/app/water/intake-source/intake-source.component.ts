import { Component, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { WaterAssessmentService } from '../water-assessment.service';
import { IntakeSource, WaterAssessment } from '../../shared/models/water-assessment';
import { WaterProcessComponentService } from '../water-system-component.service';
import * as _ from 'lodash';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';
import { copyObject } from '../../shared/helperFunctions';
import { intakeSourceTypeOptions } from '../waterConstants';

@Component({
  selector: 'app-intake-source',
  templateUrl: './intake-source.component.html',
  styleUrl: './intake-source.component.css'
})
export class IntakeSourceComponent {
  // * intake source supplied as part of a water using system
  @Input()
  systemIntakeSource: IntakeSource;

  settings: Settings;
  componentFormTitle: string;
  waterAssessment: WaterAssessment;
  selectedIntakeSource: IntakeSource;
  form: FormGroup;
  selectedComponentSub: Subscription;
  intakeSourceTypeOptions: {value: number, display: string}[];

  idString: string;
  constructor(private waterAssessmentService: WaterAssessmentService, private waterProcessComponentService: WaterProcessComponentService) {}

  ngOnInit() {
    this.intakeSourceTypeOptions = copyObject(intakeSourceTypeOptions);
    this.settings = this.waterAssessmentService.settings.getValue();
    this.componentFormTitle = this.waterAssessmentService.setWaterProcessComponentTitle('water-intake');

    if (!this.systemIntakeSource) {
      this.selectedComponentSub = this.waterProcessComponentService.selectedComponent.subscribe(selectedComponent => {
        this.selectedIntakeSource = selectedComponent as IntakeSource;
        this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
        this.waterProcessComponentService.selectedViewComponents.next(this.waterAssessment.intakeSources);
        if (this.selectedIntakeSource) {
          this.idString = this.componentFormTitle + this.selectedIntakeSource.diagramNodeId;
          this.initForm();
        }
      });
      this.setDefaultSelectedComponent();
    }
  }

  ngOnDestroy() {
    if (this.selectedComponentSub) {
      this.selectedComponentSub.unsubscribe();
    }
  }

  setDefaultSelectedComponent() {
    this.waterProcessComponentService.setDefaultSelectedComponent(this.waterAssessment.intakeSources, this.selectedIntakeSource, 'water-intake')
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

  setIntakeSourceType() {
    this.save();
  }

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  addIntakeSource() {
    this.waterAssessmentService.addNewWaterComponent('water-intake')
  }
}
