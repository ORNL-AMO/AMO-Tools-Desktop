import { Component } from '@angular/core';
import { Subscription } from 'rxjs';
import { WaterAssessmentService, WaterUsingSystemTabString } from '../water-assessment.service';
import * as _ from 'lodash';
import { WaterSystemComponentService } from '../water-system-component.service';
import { WaterUsingSystem, WaterAssessment, WaterProcessComponent, WaterTreatment } from 'process-flow-lib';

@Component({
  selector: 'app-water-using-system',
  templateUrl: './water-using-system.component.html',
  styleUrl: './water-using-system.component.css'
})
export class WaterUsingSystemComponent {
  selectedWaterUsingSystem: WaterUsingSystem;
  selectedSystemType: number;
  waterAssessment: WaterAssessment;
  waterSystemTabTitle: string;
  selectedComponentSub: Subscription;
  waterUsingSystemTabSub: Subscription;
  waterUsingSystemTab: WaterUsingSystemTabString;
  hasWaterTreatments: boolean;
  
  constructor(private waterAssessmentService: WaterAssessmentService, 
    private waterSystemComponentService: WaterSystemComponentService
  ) {}

  ngOnInit() {
    this.selectedComponentSub = this.waterSystemComponentService.selectedComponent.subscribe(selectedComponent => {
        this.selectedWaterUsingSystem = selectedComponent as WaterUsingSystem;
        this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
        this.hasWaterTreatments = this.waterAssessmentService.getHasWaterTreatments();
        this.waterSystemComponentService.selectedViewComponents.next(this.waterAssessment.waterUsingSystems as WaterProcessComponent[]);
    });

    this.waterUsingSystemTabSub = this.waterAssessmentService.waterUsingSystemTab.subscribe(val => {
      this.waterUsingSystemTab = val;
      this.waterSystemTabTitle = this.waterAssessmentService.setWaterSystemTabTitle(this.waterUsingSystemTab);
    });

    this.setDefaultSelectedComponent();
  }

  saveWaterTreatment() {
    // todo shouldnt need to take event. Should be same instance
    let updateIndex: number = this.waterAssessment.waterUsingSystems.findIndex(system => system.diagramNodeId === this.selectedWaterUsingSystem.diagramNodeId);
    this.waterAssessment.waterUsingSystems[updateIndex] = this.selectedWaterUsingSystem;
    this.waterAssessmentService.updateWaterAssessment(this.waterAssessment);
  }


  ngOnDestroy() {
    this.selectedComponentSub.unsubscribe();
    this.waterUsingSystemTabSub.unsubscribe();
  }

  setDefaultSelectedComponent() {
    this.waterSystemComponentService.setDefaultSelectedComponent(this.waterAssessment.waterUsingSystems, this.selectedWaterUsingSystem, 'water-using-system')
  }

  addWaterUsingSystem() {
    this.waterAssessmentService.addNewWaterComponent('water-using-system')
  }

}