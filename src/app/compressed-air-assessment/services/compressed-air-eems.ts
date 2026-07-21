import { DayTypeModificationResult } from '../calculations/caCalculationModels';
import { Modification } from '../../shared/models/compressed-air-assessment';

export type EemSavingsKey = 'flowReallocationSavings' | 'replaceCompressorsSavings' | 'addReceiverVolumeSavings'
  | 'adjustCascadingSetPointsSavings' | 'improveEndUseEfficiencySavings' | 'reduceAirLeaksSavings'
  | 'reduceRunTimeSavings' | 'reduceSystemAirPressureSavings' | 'useAutomaticSequencerSavings';

export interface EemDescriptor {
  label: string;
  savingsKey: EemSavingsKey;
  modificationKey: keyof Modification;
}

/**
 * Canonical list of the 9 compressed-air EEMs (energy efficiency measures), each with its
 * `DayTypeModificationResult` savings field and its `Modification` "is this EEM active" field.
 * Shared across chart building, Payback Details, and Executive Summary — each section applies
 * its own gating rule (they genuinely differ: charts/executive-summary gate the last 7 on
 * `modification[modificationKey].order != 100`, payback details gates on `savings.cost` truthy,
 * and Flow Reallocation/Replace Compressors are gated differently again per section) so this
 * list only centralizes the label/key pairing, not the gating logic itself.
 */
export const COMPRESSED_AIR_EEMS: EemDescriptor[] = [
  { label: 'Flow Reallocation', savingsKey: 'flowReallocationSavings', modificationKey: 'flowReallocation' },
  { label: 'Replace Compressors', savingsKey: 'replaceCompressorsSavings', modificationKey: 'replaceCompressor' },
  { label: 'Add Receiver Volume', savingsKey: 'addReceiverVolumeSavings', modificationKey: 'addPrimaryReceiverVolume' },
  { label: 'Adjust Cascading Set Points', savingsKey: 'adjustCascadingSetPointsSavings', modificationKey: 'adjustCascadingSetPoints' },
  { label: 'Improve End Use Efficiency', savingsKey: 'improveEndUseEfficiencySavings', modificationKey: 'improveEndUseEfficiency' },
  { label: 'Reduce Air Leaks', savingsKey: 'reduceAirLeaksSavings', modificationKey: 'reduceAirLeaks' },
  { label: 'Reduce Runtime', savingsKey: 'reduceRunTimeSavings', modificationKey: 'reduceRuntime' },
  { label: 'Reduce System Air Pressure', savingsKey: 'reduceSystemAirPressureSavings', modificationKey: 'reduceSystemAirPressure' },
  { label: 'Use Automatic Sequencer', savingsKey: 'useAutomaticSequencerSavings', modificationKey: 'useAutomaticSequencer' },
];

export function eemSavings(result: DayTypeModificationResult, key: EemSavingsKey) {
  return result[key];
}
