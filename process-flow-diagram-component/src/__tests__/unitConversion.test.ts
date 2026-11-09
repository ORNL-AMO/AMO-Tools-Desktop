/**
 * Unit tests for diagram units changes - the diagram's own units switch must convert node energy inputs
 * (heat energy temperatures, turbomachinery rated power) via convertNodeEnergyData, while convertFlowDiagramData
 * (also used when an assessment converts its diagram) only converts flows.
 */

import { describe, it, expect } from 'vitest';
import type { Node } from '@xyflow/react';
import { convertFlowDiagramData, convertNodeEnergyData } from 'process-flow-lib';
import type { ProcessFlowPart } from 'process-flow-lib';
import { makeIntakeNode, makeSystemNode, makeCalcData } from '../__fixtures__/builders';

const makeEnergySystemNode = (id: string): Node<ProcessFlowPart> => {
  const node = makeSystemNode(id) as Node<ProcessFlowPart>;
  node.data = {
    ...node.data,
    heatEnergy: { incomingTemp: 50, outgoingTemp: 212, heaterEfficiency: 80, heatingFuelType: 1, wasteWaterDischarge: undefined },
    addedMotorEnergy: [{ name: 'Pump', numberUnits: 1, hoursPerYear: 8760, loadFactor: 100, ratedPower: 100, systemEfficiency: 90 }],
  };
  return node;
};

const convert = (nodes: Node[], newUnits: string, decimalPrecision?: number) => {
  return convertNodeEnergyData(nodes, newUnits, undefined, decimalPrecision) as Node<ProcessFlowPart>[];
};

describe('convertNodeEnergyData', () => {
  it('converts heat energy temperatures F -> C and rated power hp -> kW when switching to Metric', () => {
    const [node] = convert([makeEnergySystemNode('sys')], 'Metric');
    expect(node.data.heatEnergy.incomingTemp).toBeCloseTo(10, 6);
    expect(node.data.heatEnergy.outgoingTemp).toBeCloseTo(100, 6);
    expect(node.data.addedMotorEnergy[0].ratedPower).toBeCloseTo(74.57, 6);
  });

  it('round trips back to the original Imperial values', () => {
    const [node] = convert(convert([makeEnergySystemNode('sys')], 'Metric'), 'Imperial');
    expect(node.data.heatEnergy.incomingTemp).toBeCloseTo(50, 6);
    expect(node.data.heatEnergy.outgoingTemp).toBeCloseTo(212, 6);
    expect(node.data.addedMotorEnergy[0].ratedPower).toBeCloseTo(100, 6);
  });

  it('leaves non-temperature heat inputs and empty values untouched', () => {
    const energyNode = makeEnergySystemNode('sys');
    energyNode.data.heatEnergy.outgoingTemp = undefined;
    const [node] = convert([energyNode], 'Metric');
    expect(node.data.heatEnergy.outgoingTemp).toBeUndefined();
    expect(node.data.heatEnergy.heaterEfficiency).toBe(80);
    expect(node.data.heatEnergy.heatingFuelType).toBe(1);
  });

  it('rounds converted values to the decimal precision, like the water assessment', () => {
    const energyNode = makeEnergySystemNode('sys');
    energyNode.data.heatEnergy.outgoingTemp = 55;
    const [node] = convert([energyNode], 'Metric', 2);
    expect(node.data.heatEnergy.outgoingTemp).toBe(12.78);
    expect(node.data.addedMotorEnergy[0].ratedPower).toBe(74.57);
  });

  it('does not modify the original node energy objects', () => {
    const energyNode = makeEnergySystemNode('sys');
    convert([energyNode], 'Metric');
    expect(energyNode.data.heatEnergy.incomingTemp).toBe(50);
    expect(energyNode.data.addedMotorEnergy[0].ratedPower).toBe(100);
  });

  it('handles nodes without energy data', () => {
    const [node] = convert([makeIntakeNode('in')], 'Metric');
    expect(node.data.heatEnergy).toBeUndefined();
    expect(node.data.addedMotorEnergy).toEqual([]);
  });
});

describe('convertFlowDiagramData', () => {
  it('leaves node energy inputs for the assessment to convert', () => {
    const data = { nodes: [makeEnergySystemNode('sys')] as Node[], edges: [], calculatedData: makeCalcData({}) };
    convertFlowDiagramData(data, 'Metric');
    const [node] = data.nodes as Node<ProcessFlowPart>[];
    expect(node.data.heatEnergy.incomingTemp).toBe(50);
    expect(node.data.addedMotorEnergy[0].ratedPower).toBe(100);
  });
});
