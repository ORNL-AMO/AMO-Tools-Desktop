import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { PreAssessment } from '../../pre-assessment';
import { Settings } from '../../../../../shared/models/settings';
@Component({
  selector: 'app-pre-assessment-metered',
  templateUrl: './pre-assessment-metered.component.html',
  styleUrls: ['./pre-assessment-metered.component.css']
})
export class PreAssessmentMeteredComponent implements OnInit {
  @Input()
  assessment: PreAssessment;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  constructor() { }

  ngOnInit() {
    if (!this.assessment.meteredEnergy) {
      this.assessment.meteredEnergy = {
        meteredEnergyFuel: {
          fuelDescription: 'gas',
          fuelType: 0,
          heatingValue: 0,
          collectionTime: 0,
          electricityUsed: 0,
          electricityCollectionTime: 0,
          fuelEnergy: 0
        },
        meteredEnergyElectricity: {
          electricityCollectionTime: 0,
          electricityUsed: 0,
          auxElectricityUsed: 0,
          auxElectricityCollectionTime: 0
        },
        meteredEnergySteam: {
          totalHeatSteam: 0,
          flowRate: 0,
          collectionTime: 0,
          electricityUsed: 0,
          electricityCollectionTime: 0
        }
      }
    }
  }

  calculate(){
    this.emitCalculate.emit(true);
  }

  changeField(str: string){
    this.emitChangeField.emit(str);
  }

}
