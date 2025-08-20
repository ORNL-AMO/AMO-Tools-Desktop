import { CustomNodeStyleMap } from "../constants";
import { Connection, Edge, MarkerType, Node } from "@xyflow/react";
import { DiagramSettings, Handles, ProcessFlowNodeType, ProcessFlowPart, UserDiagramOptions, WaterProcessComponentType } from "../types/diagram";
import { ConnectedFlowType, DiagramWaterSystemFlows, DischargeOutlet, EdgeFlowData, IntakeSource, WasteWaterTreatment, WaterProcessComponent, WaterSystemFlowsTotals, WaterTreatment, WaterUsingSystem } from "../types/water-components";
import { getNewIdString } from "./utils";


const getDefaultHandles = (componentType?: ProcessFlowNodeType): Handles => {
  let handles = {
    inflowHandles: {
      a: true,
      b: true,
      c: false,
      d: false,
    },
    outflowHandles: {
      e: true,
      f: true,
      g: false,
      h: false,
    }
  }

  if ('water-intake' === componentType) {
    return { outflowHandles: handles.outflowHandles };
  }

  if ('water-discharge' === componentType) {
    return { inflowHandles: handles.inflowHandles };
  }

  return handles;
}


export const processFlowDiagramParts: ProcessFlowPart[] = [
  {
    processComponentType: 'water-intake',
    name: 'Intake Source',
    className: 'water-intake',
    cost: 0,
    isValid: true,
    userEnteredData: {
      totalDischargeFlow: undefined,
      totalSourceFlow: undefined
    },
    disableInflowConnections: true,
    createdByAssessment: false,
    handles: getDefaultHandles('water-intake')
  },
  {
    processComponentType: 'water-using-system',
    name: 'Water Using System',
    className: 'water-using-system',
    cost: 0,
    systemType: 0,
    isValid: true,
    inSystemTreatment: [],
    userEnteredData: {
      totalDischargeFlow: undefined,
      totalSourceFlow: undefined
    },
    createdByAssessment: false,
    handles: getDefaultHandles()
  },
  {
    processComponentType: 'water-discharge',
    name: 'Discharge Outlet',
    className: 'water-discharge',
    disableOutflowConnections: true,
    cost: 0,
    isValid: true,
    userEnteredData: {
      totalDischargeFlow: undefined,
      totalSourceFlow: undefined
    },
    createdByAssessment: false,
    handles: getDefaultHandles('water-discharge')
  },
  {
    processComponentType: 'water-treatment',
    name: 'Water Treatment',
    className: 'water-treatment',
    cost: 0,
    isValid: true,
    treatmentType: 0,
    flowValue: 0,
    userEnteredData: {
      totalDischargeFlow: undefined,
      totalSourceFlow: undefined
    },
    createdByAssessment: false,
    handles: getDefaultHandles()
  },
  {
    processComponentType: 'waste-water-treatment',
    name: 'Wastewater Treatment',
    className: 'waste-water-treatment',
    cost: 0,
    isValid: true,
    userEnteredData: {
      totalDischargeFlow: undefined,
      totalSourceFlow: undefined
    },
    createdByAssessment: false,
    handles: getDefaultHandles()
  },
  {
    processComponentType: 'known-loss',
    name: 'Known Loss',
    className: 'known-loss',
    cost: 0,
    isValid: true,
    userEnteredData: {
      totalDischargeFlow: undefined,
      totalSourceFlow: undefined
    },
    createdByAssessment: false,
    handles: getDefaultHandles()
  },
  {
    processComponentType: 'summing-node',
    name: 'Summing Connector',
    className: 'summing-node',
    cost: 0,
    isValid: true,
    userEnteredData: {
      totalDischargeFlow: undefined,
      totalSourceFlow: undefined
    },
    createdByAssessment: false,
    handles: {
      inflowHandles: {
        a: true,
        b: true,
        c: true,
        d: true,
      },
      outflowHandles: {
        e: true,
        f: true,
        g: true,
        h: true,
      }
    }
  }
];

export interface ManageDataTab {
  label: string;
  index: number;
}

const defaultTabs: ManageDataTab[] = [
  {
    label: 'Flows',
    index: 0
  },
  {
    label: 'Manage',
    index: 1
  },
]

export const ComponentManageDataTabs: Record<WaterProcessComponentType, ManageDataTab[]> = {
  "water-intake": [
    {
      label: 'Flows',
      index: 0
    },
  ],
  "water-discharge": [
    {
      label: 'Flows',
      index: 0
    },
  ],
  "water-using-system":
    [
      {
        label: 'Flows',
        index: 0
      },
      {
        label: 'Treatment',
        index: 1
      },
      {
        label: 'Manage',
        index: 2
      }
    ],
  "summing-node": defaultTabs,
  "water-treatment": defaultTabs,
  "waste-water-treatment": defaultTabs,
  "known-loss": defaultTabs
};





export const getComponentNameFromType = (componentType) => {
  let component = processFlowDiagramParts.find(part => part.processComponentType === componentType);
  return component ? component.name : '';
}

export const getNewProcessComponent = (processComponentType: WaterProcessComponentType): ProcessFlowPart => {
  let diagramComponent: ProcessFlowPart = processFlowDiagramParts.find(part => part.processComponentType === processComponentType);
  let newProcessComponent: ProcessFlowPart = {
    processComponentType: diagramComponent.processComponentType,
    createdByAssessment: false,
    name: diagramComponent.name,
    className: diagramComponent.className,
    cost: 0,
    isValid: diagramComponent.isValid,
    disableInflowConnections: diagramComponent.disableInflowConnections,
    disableOutflowConnections: diagramComponent.disableOutflowConnections,
    userEnteredData: {
      totalDischargeFlow: diagramComponent.totalDischargeFlow as number,
      totalSourceFlow: diagramComponent.totalSourceFlow as number
    },
    diagramNodeId: getNewNodeId(),
    modifiedDate: new Date(),
    handles: { ...diagramComponent.handles },
  };

  if (newProcessComponent.processComponentType === 'water-intake' || newProcessComponent.processComponentType === 'water-discharge') {
    newProcessComponent.sourceType = 0;
    newProcessComponent.annualUse = 0;
    newProcessComponent.addedMotorEnergy = [];
  }

  if (newProcessComponent.processComponentType === 'water-using-system') {
    newProcessComponent.systemType = 0;
    newProcessComponent.inSystemTreatment = [];
    newProcessComponent.addedMotorEnergy = [];
  }

  if (newProcessComponent.processComponentType === 'water-treatment' || newProcessComponent.processComponentType === 'waste-water-treatment') {
    newProcessComponent.treatmentType = 0;
  }

  return newProcessComponent;
}


export const getNewNodeId = () => {
  let nodeId = `n_${getNewIdString()}`;
  return nodeId;
}


// todo 7410 below getter methods potentially obsolete - were used to interface diagram properties with assessment properties.
// todo getNewProcessComponent along with these is doing much more than it needs to do
export const getIntakeSource = (processFlowPart?: WaterProcessComponent): IntakeSource => {
  let intakeSource: IntakeSource;
  let newComponent: WaterProcessComponent;
  if (!processFlowPart) {
    newComponent = getNewProcessComponent('water-intake') as IntakeSource;
    intakeSource = {
      ...newComponent,
      createdByAssessment: true,
    };
  } else {
    newComponent = processFlowPart as IntakeSource;
    intakeSource = {
      ...newComponent,
    };
  }
  return intakeSource;
}

export const getDischargeOutlet = (processFlowPart?: WaterProcessComponent): DischargeOutlet => {
  let dischargeOutlet: DischargeOutlet;
  let newComponent: WaterProcessComponent;
  if (!processFlowPart) {
    newComponent = getNewProcessComponent('water-discharge') as DischargeOutlet;
    dischargeOutlet = {
      ...newComponent,
      createdByAssessment: true,
    };
  } else {
    newComponent = processFlowPart as DischargeOutlet;
    dischargeOutlet = {
      ...newComponent,
    };
  }

  return dischargeOutlet;
}


export const getWaterUsingSystem = (processFlowPart?: WaterProcessComponent): WaterUsingSystem => {
  let waterUsingSystem: WaterUsingSystem;
  let waterProcessComponent: WaterProcessComponent;
  let createdByAssessment: boolean = false;
  if (!processFlowPart) {
    waterProcessComponent = getNewProcessComponent('water-using-system') as WaterUsingSystem;
    createdByAssessment = true;
  } else {
    waterProcessComponent = processFlowPart as WaterUsingSystem;
  }

  waterUsingSystem = {
    ...waterProcessComponent,
    createdByAssessment: createdByAssessment,
    hoursPerYear: 8760,
    userDiagramFlowOverrides: {
      sourceWater: waterProcessComponent.userDiagramFlowOverrides?.sourceWater,
      recirculatedWater: waterProcessComponent.userDiagramFlowOverrides?.recirculatedWater,
      dischargeWater: waterProcessComponent.userDiagramFlowOverrides?.dischargeWater,
      knownLosses: waterProcessComponent.userDiagramFlowOverrides?.knownLosses,
      waterInProduct: waterProcessComponent.userDiagramFlowOverrides?.waterInProduct,
    },
    processUse: {
      waterRequiredMetric: 0,
      waterRequiredMetricValue: undefined,
      waterConsumedMetric: 0,
      waterConsumedMetricValue: undefined,
      waterLossMetric: 0,
      waterLossMetricValue: undefined,
      annualProduction: undefined,
      fractionGrossWaterRecirculated: undefined,
    },
    coolingTower: {
      tonnage: undefined,
      loadFactor: undefined,
      evaporationRateDegree: undefined,
      temperatureDrop: undefined,
      makeupConductivity: undefined,
      blowdownConductivity: undefined,
    },
    boilerWater: {
      power: undefined,
      loadFactor: undefined,
      steamPerPower: undefined,
      feedwaterConductivity: undefined,
      makeupConductivity: undefined,
      blowdownConductivity: undefined,
    },
    kitchenRestroom: {
      employeeCount: undefined,
      workdaysPerYear: undefined,
      dailyUsePerEmployee: undefined
    },
    landscaping: {
      areaIrrigated: undefined,
      yearlyInchesIrrigated: undefined,
    },
    addedMotorEnergy: waterProcessComponent.addedMotorEnergy || [],
    heatEnergy: waterProcessComponent.heatEnergy || {
      incomingTemp: undefined,
      outgoingTemp: undefined,
      heaterEfficiency: undefined,
      heatingFuelType: 0,
      wasteWaterDischarge: undefined
    },
    systemFlowTotals: {
      sourceWater: waterProcessComponent.systemFlowTotals?.sourceWater,
      recirculatedWater: waterProcessComponent.systemFlowTotals?.recirculatedWater,
      dischargeWater: waterProcessComponent.systemFlowTotals?.dischargeWater,
      knownLosses: waterProcessComponent.systemFlowTotals?.knownLosses,
      waterInProduct: waterProcessComponent.systemFlowTotals?.waterInProduct,
    }
  }

  return waterUsingSystem;
}

export const getWaterTreatmentComponent = (existingTreatment: WaterTreatment): WaterTreatment => {
  let waterTreatment: WaterTreatment;
  let newComponent: WaterTreatment;
  newComponent = existingTreatment as WaterTreatment;
  waterTreatment = {
    ...newComponent,
  };
  return waterTreatment;
}

export const getNewWaterTreatmentComponent = (inSystem: boolean = false, createdByAssessment: boolean = false) => {
  let waterTreatment: WaterTreatment;
  let newComponent: WaterTreatment = getNewProcessComponent('water-treatment') as WaterTreatment;
  waterTreatment = {
    ...newComponent,
    createdByAssessment: createdByAssessment,
  };

  if (inSystem) {
    delete waterTreatment.modifiedDate
  }

  return waterTreatment;
}

export const getWasteWaterTreatmentComponent = (processFlowPart?: WaterProcessComponent): WasteWaterTreatment => {
  let wasteWaterTreatment: WasteWaterTreatment;
  let newComponent: WasteWaterTreatment;
  if (!processFlowPart) {
    newComponent = getNewProcessComponent('waste-water-treatment') as WasteWaterTreatment;
    wasteWaterTreatment = {
      ...newComponent,
      createdByAssessment: true,
    };
  } else {
    newComponent = processFlowPart as WasteWaterTreatment;
    wasteWaterTreatment = {
      ...newComponent,
    };
  }

  return wasteWaterTreatment;
}



export const getNewNode = (nodeType: WaterProcessComponentType, newProcessComponent: ProcessFlowPart, position?: { x: number, y: number }): Node => {
  const newNode: Node = {
    id: newProcessComponent.diagramNodeId,
    type: nodeType,
    position: position,
    className: newProcessComponent.className,
    data: newProcessComponent,
    style: CustomNodeStyleMap[nodeType]
  };

  return newNode;
}



/**
* Set flows from users values, or default to diagram values
*/
export const getWaterFlowsFromSource = (waterUsingSystem: WaterUsingSystem, diagramWaterSystemFlows: DiagramWaterSystemFlows): WaterSystemFlowsTotals => {
  let systemFlowTotals: WaterSystemFlowsTotals = {
    sourceWater: diagramWaterSystemFlows.sourceWater.total,
    recirculatedWater: diagramWaterSystemFlows.recirculatedWater.total,
    dischargeWater: diagramWaterSystemFlows.dischargeWater.total,
    knownLosses: diagramWaterSystemFlows.knownLosses.total,
    waterInProduct: diagramWaterSystemFlows.waterInProduct.total,
  };
  Object.keys(waterUsingSystem.userDiagramFlowOverrides).forEach((key: ConnectedFlowType) => {
    systemFlowTotals[key] = waterUsingSystem.userDiagramFlowOverrides[key] ?? diagramWaterSystemFlows[key].total;
  });
  return systemFlowTotals;
}

export const getWaterFlowTotals = (diagramWaterSystemFlows: DiagramWaterSystemFlows): WaterSystemFlowsTotals => {
  let systemFlowTotals: WaterSystemFlowsTotals = {
    sourceWater: diagramWaterSystemFlows.sourceWater.total,
    recirculatedWater: diagramWaterSystemFlows.recirculatedWater.total,
    dischargeWater: diagramWaterSystemFlows.dischargeWater.total,
    knownLosses: diagramWaterSystemFlows.knownLosses.total,
    waterInProduct: diagramWaterSystemFlows.waterInProduct.total,
  };
  return systemFlowTotals;
}


export const getAssessmentWaterSystemFlowEdges = (diagramWaterSystemFlows: DiagramWaterSystemFlows[]): { source: string, target: string }[] => {
  const waterSystemFlowEdges: { source: string, target: string }[] = diagramWaterSystemFlows.flatMap((systemFlow: DiagramWaterSystemFlows) => {
    if (!systemFlow) {
      return [];
    }
    return Object.values(systemFlow).flatMap((property: any) => {
      if (!property || !property.flows) {
        return [];
      }
      return property.flows.map((flow: EdgeFlowData) => ({
        source: flow.source,
        target: flow.target,
      }));
    });
  });

  return waterSystemFlowEdges;
}

/**
* edge ids are not gauranteed to be unique. They only include nodeid-nodeid. source and target handles must be looked at to identify uniqueness of edge 
* 
*/
export const getEdgeFromConnection = (
  connectedParams: Connection | Edge,
  userDiagramOptions: UserDiagramOptions,
  shouldSetId: boolean = false
) => {
  connectedParams = connectedParams as Edge;
  if (connectedParams.source === connectedParams.target) {
    connectedParams.type = 'selfconnecting';
  }

  if (userDiagramOptions.directionalArrowsVisible) {
    connectedParams.markerEnd = {
      type: MarkerType.ArrowClosed,
      width: 25,
      height: 25
    }
  }

  connectedParams.data = {
    flowValue: null,
  }

  if (connectedParams.style === undefined) {
    connectedParams.style = {
      stroke: '#6c757d',
      strokeWidth: userDiagramOptions.strokeWidth
    }
  }

  if (shouldSetId) {
    connectedParams.id = getNewEdgeId(connectedParams.source, connectedParams.target);
  }

  return connectedParams;
}

export const getNewEdgeId = (sourceId: string, targetId: string): string => {
  return `xy-edge__${sourceId}-${targetId}`;
}


export const getDefaultUserDiagramOptions = (): UserDiagramOptions => {
  return {
    strokeWidth: 2,
    edgeType: 'smoothstep',
    minimapVisible: false,
    controlsVisible: true,
    directionalArrowsVisible: true,
    showFlowLabels: true,
    flowLabelSize: 1,
    animated: false,
  }
}

export const getDefaultSettings = (): DiagramSettings => {
  return {
    unitsOfMeasure: 'Imperial',
    electricityCost: .066,
    fuelCost: 3.99,
    flowDecimalPrecision: 2,
    conductivityUnit: 'mmho',
  }
}

export const getDefaultColorPalette = () => {
  return ['#75a1ff', '#7f7fff', '#00bbff', '#009386', '#93e200'];
}


