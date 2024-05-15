import { Root, createRoot } from 'react-dom/client';
import { FlowProps } from './components/Flow';
import retargetEvents from 'react-shadow-dom-retarget-events';
import App from './App';

class AppWebComponent extends HTMLElement {
  mountPoint!: HTMLDivElement;
  appRef!: Root;
  name!: string;
  static observedAttributes = ['measurdata']; 

  // DiagramWrapperComponent = (measurData) => {
  //   console.log('DiagramWrapperComponent diagramData', measurData);
  //   // todo wrap with strict mode for dev
  //   return (
  //       <div className={'wc-app-container'}>
  //         <header className={'wc-app-header'}>React Flow - Vite Example</header>
  //         <Flow diagramData={measurData} measurStateHandlers={} />
  //       </div>
  //   );
  // };

  renderDiagramComponent(measurData) {
    this.appRef.render(<App diagramData={measurData} measurStateHandlers={{clickEvent: this.handleClickEvent}}/>)
    // return <this.DiagramWrapperComponent measurData={measurData}/>
  }


  connectedCallback() {
    console.log('PROCESS-FLOW-DIAGRAM init connectedCallback')
    this.style.display = 'block';
    this.style.height = '100%';

    const shadowRoot = this.attachShadow({ mode: 'open' });
    this.mountPoint = document.createElement('div');
    this.mountPoint.id = 'root';
    shadowRoot.appendChild(this.mountPoint);
    
    // todo using link ref in this way may require polyfill
    const link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("href", "process-flow-diagram-component.css");
    shadowRoot.appendChild(link);

    this.appRef = createRoot(this.mountPoint!);
    this.renderDiagramComponent(this.measurdata)
    // todo react apis may have changed since this was needed below
    retargetEvents(shadowRoot);
  }


  get measurdata() {
    const attrString = this.getAttribute("measurdata");
    const measurDataProperty = JSON.parse(attrString);
    return measurDataProperty;
  }

  set measurdata(newValue) {
    // const newValue = coerceType(value);
    this.setAttribute("measurdata", JSON.stringify(newValue));
    console.log('setting measurdata', newValue)
  }

  attributeChangedCallback(attrName, prev, current) {
    if (attrName === 'measurdata') {
      console.log('Rerendering with new measurdata', prev, current)
      this.renderDiagramComponent(this.measurdata)
    }
  }

  handleClickEvent = (...args) => {
    const event = new CustomEvent('wcEventTest', {
      composed: true,
      bubbles: true,
      detail:  args? args[0] : 'no info'
    })
    this.mountPoint.dispatchEvent(event);
    console.log('WC dispatching click event', event);
  }

  emitWcEventTest1() {
    const event = new CustomEvent('wcEventTest', {
      composed: true,
      bubbles: true,
      detail: 'eventTest detail coming from wc'
    })
    this.mountPoint.dispatchEvent(event);
    console.log('WC dispatching evnetTest1', event);

  }

  emitWcEventTest2() {
    const detail = {
      wpdObject: MockPsat
    }
    const event = new CustomEvent("wcEventTest2", {
      detail: detail,
    });
    this.dispatchEvent(event);
    console.log('WC dispatching evnetTest2', event);
  }

  // setPropsFromAttributes<T>(): T {
  //   const props: Record<string, any> = {};
  //   console.log('setPropsFromAttributes -- attributes', this.attributes);
  //   for (let index = 0; index < this.attributes.length; index++) {
  //     const attribute = this.attributes[index];
  //     let value: any = attribute.value;
  //     if (attribute.name === 'measurdata') {
  //       value = JSON.parse(attribute.value);
  //       console.log('value', value)
  //       console.log('typeof', typeof value)
  //       console.log('name', value.name)
  //       console.log('fsat', value.fsat)

  //     }
  //     props[normalizeAttribute(attribute.name)] = value;
  //   }

  //   console.log('props', props);
  //   // todo trigger react component update
  //   return props as T;
  // }
}

export default AppWebComponent;
export interface ProcessFlowDiagramWrapperProps extends FlowProps {};

// export const normalizeAttribute = (attribute: string) => {
//   return attribute.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase());
// };

export const MockPsat = {
  "name": "Pump Example",
  "type": "PSAT",
  "isExample": true,
  "psat": {
    "inputs": {
      "pump_style": 6,
      "pump_specified": null,
      "pump_rated_speed": 2000,
      "drive": 1,
      "kinematic_viscosity": 1.107,
      "specific_gravity": 1.002,
      "stages": 1,
      "fixed_speed": 0,
      "line_frequency": 60,
      "motor_rated_power": 350.01,
      "motor_rated_speed": 2000,
      "efficiency_class": 0,
      "efficiency": 95,
      "motor_rated_voltage": 460,
      "load_estimation_method": 1,
      "motor_rated_fla": 389.08,
      "margin": 0,
      "operating_hours": 8760,
      "flow_rate": 2500,
      "head": 410,
      "motor_field_power": 88.2,
      "motor_field_current": 370,
      "motor_field_voltage": 460,
      "cost_kw_hour": 0.066,
      "fluidType": "Water",
      "fluidTemperature": 68,
      "specifiedDriveEfficiency": null,
      "implementationCosts": null,
      "whatIfScenario": true,
      "co2SavingsData": {
        "energyType": 'electricity',
        "energySource": '',
        "fuelType": '',
        "totalEmissionOutputRate": 401.07,
        "electricityUse": 0,
        "eGridRegion": '',
        "eGridSubregion": 'U.S. Average',
        "totalEmissionOutput": 0,
        "userEnteredBaselineEmissions": false,
        "userEnteredModificationEmissions": true,
        "zipcode": '00000',
      }
    },
    "modifications": [{
      "id": "wjrol3dhb",
      "psat": {
        "name": "New Pump and Motor",
        "inputs": {
          "pump_style": 6,
          "pump_specified": 87.52,
          "pump_rated_speed": 2000,
          "drive": 1,
          "kinematic_viscosity": 1.107,
          "specific_gravity": 1.002,
          "stages": 1,
          "fixed_speed": 0,
          "line_frequency": 60,
          "motor_rated_power": 350.01,
          "motor_rated_speed": 2000,
          "efficiency_class": 2,
          "efficiency": 95,
          "motor_rated_voltage": 460,
          "load_estimation_method": 1,
          "motor_rated_fla": 376.86,
          "margin": 0,
          "operating_hours": 8760,
          "flow_rate": 2499.99,
          "head": 409.99,
          "motor_field_power": 88.2,
          "motor_field_current": 187,
          "motor_field_voltage": 460,
          "cost_kw_hour": 0.066,
          "fluidType": "Water",
          "fluidTemperature": 68,
          "specifiedDriveEfficiency": null,
          "implementationCosts": null,
          "whatIfScenario": true,
          "co2SavingsData": {
            "energyType": 'electricity',
            "energySource": '',
            "fuelType": '',
            "totalEmissionOutputRate": 401.07,
            "electricityUse": 0,
            "eGridRegion": '',
            "eGridSubregion": 'U.S. Average',
            "totalEmissionOutput": 0,
            "userEnteredBaselineEmissions": false,
            "userEnteredModificationEmissions": true,
            "zipcode": '00000',
          }
        }
      },
      "notes": {
        "fieldDataNotes": "",
        "motorNotes": "",
        "pumpFluidNotes": "",
        "systemBasicsNotes": ""
      }
    }, {
      "id": "uk0olxdjb",
      "psat": {
        "name": "VFD reduce speed to 90%",
        "inputs": {
          "pump_style": 11,
          "pump_specified": 67,
          "pump_rated_speed": 1600,
          "drive": 4,
          "kinematic_viscosity": 1.107,
          "specific_gravity": 1.002,
          "stages": 1,
          "fixed_speed": 0,
          "line_frequency": 60,
          "motor_rated_power": 350.01,
          "motor_rated_speed": 2000,
          "efficiency_class": 0,
          "efficiency": 95,
          "motor_rated_voltage": 460,
          "load_estimation_method": 1,
          "motor_rated_fla": 389.08,
          "margin": 0,
          "operating_hours": 8760,
          "flow_rate": 2236.5,
          "head": 327.7,
          "motor_field_power": 88.2,
          "motor_field_current": 187,
          "motor_field_voltage": 460,
          "cost_kw_hour": 0.066,
          "fluidType": "Water",
          "fluidTemperature": 68,
          "specifiedDriveEfficiency": 95,
          "implementationCosts": null,
          "isVFD": true,
          "whatIfScenario": true,
          "co2SavingsData": {
            "energyType": 'electricity',
            "energySource": '',
            "fuelType": '',
            "totalEmissionOutputRate": 401.07,
            "electricityUse": 0,
            "eGridRegion": '',
            "eGridSubregion": 'U.S. Average',
            "totalEmissionOutput": 0,
            "userEnteredBaselineEmissions": false,
            "userEnteredModificationEmissions": true,
            "zipcode": '00000',
          }
        }
      },
      "notes": {
        "fieldDataNotes": "Using system curve calculator, new pump curve meets system curve at 2236.5 gpm and 327.7 ft.",
        "motorNotes": "",
        "pumpFluidNotes": "Using Manuf.'s pump curve - Efficiency at 1800 rpm, 2237 gpm, 330 ft is ~ 67%",
        "systemBasicsNotes": ""
      },
      "exploreOpportunities": true
    }],
    "name": "Baseline",
    "setupDone": true
  },
  "modifiedDate": new Date(),
  "appVersion": "0.5.3-beta"
}; 