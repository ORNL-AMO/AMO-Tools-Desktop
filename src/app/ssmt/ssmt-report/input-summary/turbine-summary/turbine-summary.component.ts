import { Component, OnInit, Input } from '@angular/core';
import { SSMTInputs, CondensingTurbine, TurbineInput, PressureTurbine } from '../../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-turbine-summary',
  templateUrl: './turbine-summary.component.html',
  styleUrls: ['./turbine-summary.component.css']
})
export class TurbineSummaryComponent implements OnInit {
  @Input()
  baselineInputData: SSMTInputs;
  @Input()
  modificationInputData: Array<{ name: string, inputData: SSMTInputs }>;

  collapse: boolean = true;
  numMods: number = 0;

  showCondensingTurbine: boolean = false;
  showHighToMediumTurbine: boolean = false;
  showHighToLowTurbine: boolean = false;
  showMediumToLowTurbine: boolean;

  baselineCondensingTurbineData: CondensingTurbine;
  baselineHighToLowTurbineData: PressureTurbine;
  baselineHighToMediumTurbineData: PressureTurbine;
  baselineMediumToLowTurbineData: PressureTurbine;

  modificationCondensingTurbineData: Array<{ turbine: CondensingTurbine, name: string }>;
  modificationHighToLowTurbineData: Array<{ turbine: PressureTurbine, name: string }>;
  modificationHighToMediumTurbineData: Array<{ turbine: PressureTurbine, name: string }>;
  modificationMediumToLowTurbineData: Array<{ turbine: PressureTurbine, name: string }>;

  constructor() { }

  ngOnInit() {
    if (this.modificationInputData) {
      this.numMods = this.modificationInputData.length;
    }
    this.modificationCondensingTurbineData = new Array<{ turbine: CondensingTurbine, name: string }>();
    this.modificationHighToLowTurbineData = new Array<{ turbine: PressureTurbine, name: string }>();
    this.modificationHighToMediumTurbineData = new Array<{ turbine: PressureTurbine, name: string }>();
    this.modificationMediumToLowTurbineData = new Array<{ turbine: PressureTurbine, name: string }>();

    if (this.baselineInputData.turbineInput.condensingTurbine.useTurbine == true) {
      this.showCondensingTurbine = true;
    }
    if (this.baselineInputData.headerInput.numberOfHeaders > 1) {
      if (this.baselineInputData.turbineInput.highToLowTurbine.useTurbine == true) {
        this.showHighToLowTurbine = true;
      }

      if (this.baselineInputData.headerInput.numberOfHeaders == 3) {
        if (this.baselineInputData.turbineInput.highToMediumTurbine.useTurbine == true) {
          this.showHighToMediumTurbine = true;
        }
        if (this.baselineInputData.turbineInput.mediumToLowTurbine.useTurbine == true) {
          this.showMediumToLowTurbine = true;
        }
      }
    }

    this.baselineCondensingTurbineData = this.baselineInputData.turbineInput.condensingTurbine;
    this.baselineHighToLowTurbineData = this.baselineInputData.turbineInput.highToLowTurbine;
    this.baselineHighToMediumTurbineData = this.baselineInputData.turbineInput.highToMediumTurbine;
    this.baselineMediumToLowTurbineData = this.baselineInputData.turbineInput.mediumToLowTurbine;

    this.modificationInputData.forEach(modification => {
      if (modification.inputData.turbineInput.condensingTurbine.useTurbine == true) {
        this.showCondensingTurbine = true;
      }

      if (modification.inputData.headerInput.numberOfHeaders > 1) {
        if (modification.inputData.turbineInput.highToLowTurbine.useTurbine == true) {
          this.showHighToLowTurbine = true;
        }

        if (modification.inputData.headerInput.numberOfHeaders == 3) {
          if (modification.inputData.turbineInput.highToMediumTurbine.useTurbine == true) {
            this.showHighToMediumTurbine = true;
          }
          if (modification.inputData.turbineInput.mediumToLowTurbine.useTurbine == true) {
            this.showMediumToLowTurbine = true;
          }
        }
      }
      this.modificationCondensingTurbineData.push(
        {
          turbine: modification.inputData.turbineInput.condensingTurbine,
          name: modification.name
        }
      );
      this.modificationHighToLowTurbineData.push(
        {
          turbine: modification.inputData.turbineInput.highToLowTurbine,
          name: modification.name
        }
      );
      this.modificationHighToMediumTurbineData.push(
        {
          turbine: modification.inputData.turbineInput.highToMediumTurbine,
          name: modification.name
        }
      );

      this.modificationMediumToLowTurbineData.push(
        {
          turbine: modification.inputData.turbineInput.mediumToLowTurbine,
          name: modification.name
        }
      );
    })

  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }
}
