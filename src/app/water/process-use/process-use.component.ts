import { Component } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ProcessUse, WaterAssessment, WaterProcessComponent } from '../../shared/models/water-assessment';
import { WaterAssessmentService } from '../water-assessment.service';
import { FormGroup } from '@angular/forms';
import { WaterProcessComponentService } from '../water-system-component.service';
import * as _ from 'lodash';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-process-use',
  templateUrl: './process-use.component.html',
  styleUrl: './process-use.component.css'
})
export class ProcessUseComponent {
  settings: Settings;
  selectedProcessUse: ProcessUse;
  componentFormTitle: string;
  form: FormGroup;
  selectedComponentSub: Subscription;
  waterAssessment: WaterAssessment;
  constructor(private waterAssessmentService: WaterAssessmentService, private waterProcessComponentService: WaterProcessComponentService) {}

  ngOnInit() {
    this.settings = this.waterAssessmentService.settings.getValue();
    this.componentFormTitle = this.waterAssessmentService.setWaterProcessComponentTitle('process-use');
    
    this.selectedComponentSub = this.waterProcessComponentService.selectedComponent.subscribe(selectedComponent => {
      this.selectedProcessUse = selectedComponent;
      this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
      this.waterProcessComponentService.selectedViewComponents.next(this.waterAssessment.processUses);
      if (this.selectedProcessUse) {
        this.initForm();
      }
    });
    this.setDefaultSelectedComponent();
  }

  ngOnDestroy() {
    this.selectedComponentSub.unsubscribe();
  }

  setDefaultSelectedComponent() {
    if (!this.selectedProcessUse || (this.selectedProcessUse && this.selectedProcessUse.processComponentType !== 'process-use')) {
      let lastModified: WaterProcessComponent = _.maxBy(this.waterAssessment.processUses, 'modifiedDate');
      this.waterProcessComponentService.selectedComponent.next(lastModified);
    }
  }

  initForm() {
   this.form = this.waterProcessComponentService.getProcessUseForm(this.selectedProcessUse);
  }

  save() {
    let updated: ProcessUse = this.waterProcessComponentService.getProcessUseFromForm(this.form, this.selectedProcessUse);
    let waterAssessment: WaterAssessment = this.waterAssessmentService.waterAssessment.getValue();
    let updateIndex: number = waterAssessment.processUses.findIndex(process => process.diagramNodeId === updated.diagramNodeId);
    waterAssessment.processUses[updateIndex] = updated;
    this.waterAssessmentService.waterAssessment.next(waterAssessment);
  }

  focusField(str: string) {
    this.waterAssessmentService.focusedField.next(str);
  }

  addProcessUse() {
    this.waterAssessmentService.addNewWaterComponent('process-use')
  }
}

