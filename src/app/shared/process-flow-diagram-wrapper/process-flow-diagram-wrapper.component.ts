import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { Assessment } from '../models/assessment';

@Component({
  selector: 'app-process-flow-diagram-wrapper',
  standalone: false,
  templateUrl: './process-flow-diagram-wrapper.component.html',
  styleUrl: './process-flow-diagram-wrapper.component.css'
})
export class ProcessFlowDiagramWrapperComponent {

  @Input('measurdata') 
  measurData: string;
  @Output() 
  wcEvent = new EventEmitter<any>();

  @ViewChild('pfdComponent', { static: false }) processFlowDiagramElement: ElementRef;

  constructor(
  ) { }
  
  ngOnInit() {}

  ngAfterViewInit() {
    if (this.processFlowDiagramElement) {
      const measurData = {
        name: 'initial',
        fsat: undefined
      }
      this.processFlowDiagramElement.nativeElement.measurdata = measurData;
      
      setTimeout(() => {
        const measurData = {
            name: 'fsat',
            fsat: MockFsat
          }
        this.processFlowDiagramElement.nativeElement.measurdata = measurData;
      }, 8000);
    }
  }
  
  handleWCEventTest(event) {
    console.log('handleWCEventTest', event)
  }

  handleWCEventTest2(event) {
    let wpdObject = event.detail.wpdObject
    console.log('handleWCEventTest2', event)
  }

}

export interface TestState {
  name: string;
  fsat: Assessment;
}

const MockFsat = {
  isExample: true,
  name: "Fan Example",
  type: "FSAT",
  fsat: {
      name: "Baseline",
      fieldData: {
          flowRate: 129691,
          inletPressure: -16.36,
          inletVelocityPressure: -2.5,
          usingStaticPressure: true,
          outletPressure: 1.1,
          loadEstimatedMethod: 0,
          motorPower: 450,
          compressibilityFactor: 0.988,
          measuredVoltage: 460
      },
      fsatOperations: {
          operatingHours: 8760,
          cost: 0.06,
          cO2SavingsData: {
              energyType: 'electricity',
              energySource: '',
              fuelType: '',
              totalEmissionOutputRate: 401.07,
              electricityUse: 0,
              eGridRegion: '',
              eGridSubregion: 'U.S. Average',
              totalEmissionOutput: 0,
              userEnteredBaselineEmissions: false,
              userEnteredModificationEmissions: true,
              zipcode: '00000',
          },
      },
      fanMotor: {
          lineFrequency: 60,
          motorRatedPower: 600,
          motorRpm: 1180,
          efficiencyClass: 1,
          specifiedEfficiency: 100,
          motorRatedVoltage: 460,
          fullLoadAmps: 683.25
      },
      fanSetup: {
          fanType: 0,
          fanSpeed: 1180,
          drive: 1,
          specifiedDriveEfficiency: 100
      },
      baseGasDensity: {
          inputType: "custom",
          gasType: "AIR",
          dryBulbTemp: null,
          staticPressure: null,
          barometricPressure: 29.36,
          specificGravity: 1,
          wetBulbTemp: 119,
          relativeHumidity: 0,
          dewPoint: 0,
          specificHeatRatio: 1.4,
          gasDensity: 0.0308,
          specificHeatGas: 0.24
      },
      notes: {
          fieldDataNotes: "",
          fanMotorNotes: "",
          fanSetupNotes: "",
          fluidNotes: ""
      },
      implementationCosts: 0,
      setupDone: true,
      modifications: [
          {
              fsat: {
                  name: "Optimize Fan & Motor Combo",                    
                  whatIfScenario: true,
                  notes: {
                      fieldDataNotes: "",
                      fanMotorNotes: "",
                      fanSetupNotes: "",
                      fluidNotes: ""
                  },
                  baseGasDensity: {
                      inputType: "custom",
                      gasType: "AIR",
                      dryBulbTemp: null,
                      staticPressure: null,
                      barometricPressure: 29.36,
                      specificGravity: 1,
                      wetBulbTemp: 119,
                      relativeHumidity: 0,
                      dewPoint: 0,
                      gasDensity: 0.0308,
                      specificHeatGas: 0.24,
                      specificHeatRatio: 1.4,
                  },
                  fanMotor: {
                      lineFrequency: 60,
                      motorRatedPower: 600,
                      motorRpm: 1180,
                      efficiencyClass: 2,
                      specifiedEfficiency: 90,
                      motorRatedVoltage: 460,
                      fullLoadAmps: 683.25
                  },
                  fanSetup: {
                      fanType: 0,
                      fanEfficiency: 75.66,
                      fanSpeed: 1180,
                      drive: 1,
                      specifiedDriveEfficiency: 100
                  },
                  fsatOperations: {
                      operatingHours: 8760,
                      cost: 0.06,
                      cO2SavingsData: {
                          energyType: 'electricity',
                          energySource: '',
                          fuelType: '',
                          totalEmissionOutputRate: 401.07,
                          electricityUse: 0,
                          eGridRegion: '',
                          eGridSubregion: 'U.S. Average',
                          totalEmissionOutput: 0,
                          userEnteredBaselineEmissions: false,
                          userEnteredModificationEmissions: true,
                          zipcode: '00000',
                      },  
                  },                  
                  fieldData: {
                      flowRate: 129691,
                      inletPressure: -16.36,
                      inletVelocityPressure: -1.5,
                      usingStaticPressure: true,
                      outletPressure: 1.1,
                      loadEstimatedMethod: 0,
                      motorPower: 450,
                      compressibilityFactor: 0.987,
                      measuredVoltage: 460
                  }
              },
              id: 'lorol3dhb',
              exploreOpportunities: true
          },
          {
              fsat: {
                  name: "Reduce pressure & flow",
                  whatIfScenario: true,
                  notes: {
                      fieldDataNotes: "",
                      fanMotorNotes: "",
                      fanSetupNotes: "",
                      fluidNotes: ""
                  },
                  baseGasDensity: {
                      inputType: "custom",
                      gasType: "AIR",
                      dryBulbTemp: null,
                      staticPressure: null,
                      barometricPressure: 29.36,
                      specificGravity: 1,
                      wetBulbTemp: 119,
                      relativeHumidity: 0,
                      dewPoint: 0,
                      gasDensity: 0.0308,
                      specificHeatGas: 0.24,
                      specificHeatRatio: 1.4,
                  },
                  fanMotor: {
                      lineFrequency: 60,
                      motorRatedPower: 600,
                      motorRpm: 1180,
                      efficiencyClass: 1,
                      specifiedEfficiency: 90,
                      motorRatedVoltage: 460,
                      fullLoadAmps: 683.25
                  },
                  fanSetup: {
                      fanType: 12,
                      fanEfficiency: 73,
                      fanSpeed: 1180,
                      drive: 1,
                      specifiedDriveEfficiency: 100
                  },
                  fsatOperations: {
                      operatingHours: 8760,
                      cost: 0.06,
                      cO2SavingsData: {
                          energyType: 'electricity',
                          energySource: '',
                          fuelType: '',
                          totalEmissionOutputRate: 401.07,
                          electricityUse: 0,
                          eGridRegion: '',
                          eGridSubregion: 'U.S. Average',
                          totalEmissionOutput: 0,
                          userEnteredBaselineEmissions: false,
                          userEnteredModificationEmissions: true,
                          zipcode: '00000',
                      },  
                  },
                  fieldData: {
                      flowRate: 86461,
                      inletPressure: -19.19,
                      inletVelocityPressure: -3.5,
                      usingStaticPressure: true,
                      outletPressure: 1.29,
                      loadEstimatedMethod: 0,
                      motorPower: 450,
                      compressibilityFactor: 0.986,
                      measuredVoltage: 460
                  }
              },
              id: 'usbnl3dhb',
              exploreOpportunities: true
          }
      ]
  }
};