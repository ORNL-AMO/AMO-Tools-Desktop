import { Component } from '@angular/core';
import {  WaterAssessment, WaterProcessComponent, WaterUsingSystem } from '../../shared/models/water-assessment';
import { Subscription } from 'rxjs';
import { WaterAssessmentService, WaterUsingSystemTabString } from '../water-assessment.service';
import * as _ from 'lodash';
import { WaterProcessComponentService } from '../water-system-component.service';

@Component({
  selector: 'app-water-using-system',
  templateUrl: './water-using-system.component.html',
  styleUrl: './water-using-system.component.css'
})
export class WaterUsingSystemComponent {
  selectedWaterUsingSystem: WaterUsingSystem;
  selectedSystemType: number;
  waterAssessment: WaterAssessment;
  componentFormTitle: string;
  waterSystemTabTitle: string;
  selectedComponentSub: Subscription;
  waterUsingSystemTabSub: Subscription;
  waterUsingSystemTab: WaterUsingSystemTabString;
  
  constructor(private waterAssessmentService: WaterAssessmentService, 
    private waterProcessComponentService: WaterProcessComponentService
  ) {}

  ngOnInit() {
    this.componentFormTitle = this.waterAssessmentService.setWaterProcessComponentTitle('water-using-system');
    this.selectedComponentSub = this.waterProcessComponentService.selectedComponent.subscribe(selectedComponent => {
      this.selectedWaterUsingSystem = selectedComponent as WaterUsingSystem;
      this.waterAssessment = this.waterAssessmentService.waterAssessment.getValue();
      this.waterProcessComponentService.selectedViewComponents.next(this.waterAssessment.waterUsingSystems as WaterProcessComponent[]);
    });

    this.waterUsingSystemTabSub = this.waterAssessmentService.waterUsingSystemTab.subscribe(val => {
      this.waterUsingSystemTab = val;
      this.waterSystemTabTitle = this.waterAssessmentService.setWaterSystemTabTitle(this.waterUsingSystemTab);
    });

    this.setDefaultSelectedComponent();
  }

  ngOnDestroy() {
    this.selectedComponentSub.unsubscribe();
    this.waterUsingSystemTabSub.unsubscribe();
  }

  setDefaultSelectedComponent() {
    this.waterProcessComponentService.setDefaultSelectedComponent(this.waterAssessment.waterUsingSystems, this.selectedWaterUsingSystem, 'water-using-system')
  }

  addWaterUsingSystem() {
    this.waterAssessmentService.addNewWaterComponent('water-using-system')
  }

}