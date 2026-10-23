/**
 * Targeted coverage that is absent from the sanitized real assessments.
 *
 * Each case clones a sanitized fixture, changes only the inputs needed for the
 * missing scenario, and remains in memory. This avoids inventing a second saved-
 * data format and ensures synthetic cases follow the same migration/calculation
 * path as real assessments. Keep coverageTags synchronized with each mutation;
 * they explain why the fixture exists and drive deterministic core selection.
 */
import { ConvertCompressedAirService } from '../../convert-compressed-air.service';

export interface CompressedAirRegressionTestFixture {
  fixtureId: string;
  source: 'sanitized-backup' | 'sanitized-export' | 'synthetic';
  coverageTags: string[];
  assessment: any;
  settings: any;
}

export function createSyntheticFixtures(
  realFixtures: CompressedAirRegressionTestFixture[],
  convertCompressedAirService: ConvertCompressedAirService,
): CompressedAirRegressionTestFixture[] {
  return [
    createPositiveDisplacementControls(realFixtures),
    createCentrifugalControls(realFixtures),
    createMetricLoadSharing(realFixtures, convertCompressedAirService),
    createCascadingReplacement(realFixtures),
    createTwentyFourHourBoundaries(realFixtures),
    createHalfHourPercentPower(realFixtures),
  ];
}

function createPositiveDisplacementControls(realFixtures: CompressedAirRegressionTestFixture[]): CompressedAirRegressionTestFixture {
  // Adds modulation-without-unload, start/stop, and reciprocating coverage.
  const fixture = cloneFixture(findFixture(realFixtures, 'ca-real-002'), 'ca-synthetic-001');
  const data = fixture.assessment.compressedAirAssessment;
  const first = data.compressorInventoryItems[0];
  const second = data.compressorInventoryItems[1] ?? clone(first);
  const third = clone(first);
  first.compressorControls.controlType = 1;
  second.compressorControls.controlType = 6;
  third.itemId = `${fixture.fixtureId}-compressor-03`;
  third.name = 'Compressor 3';
  third.nameplateData.compressorType = 4;
  third.compressorControls.controlType = 6;
  data.compressorInventoryItems = [first, second, third];
  cloneProfileForCompressor(data, first.itemId, third.itemId);
  fixture.coverageTags = [
    'compressor-type:1', 'compressor-type:4', 'control-type:1', 'control-type:6',
    'interval:1', 'profile-type:percentCapacity', 'synthetic',
  ];
  return fixture;
}

function createCentrifugalControls(realFixtures: CompressedAirRegressionTestFixture[]): CompressedAirRegressionTestFixture {
  // Exercises all centrifugal control IDs using one consistent compressor shape.
  const fixture = cloneFixture(findFixture(realFixtures, 'ca-real-008'), 'ca-synthetic-002');
  const data = fixture.assessment.compressedAirAssessment;
  const centrifugal = data.compressorInventoryItems.find(item => item.nameplateData.compressorType === 6)
    ?? data.compressorInventoryItems[0];
  const originalId = centrifugal.itemId;
  data.compressorInventoryItems = [7, 8, 10].map((controlType, index) => {
    const compressor = clone(centrifugal);
    compressor.itemId = `${fixture.fixtureId}-compressor-${index + 1}`;
    compressor.name = `Compressor ${index + 1}`;
    compressor.nameplateData.compressorType = 6;
    compressor.compressorControls.controlType = controlType;
    return compressor;
  });
  const originalProfiles = data.systemProfile.profileSummary.filter(profile => profile.compressorId === originalId);
  data.systemProfile.profileSummary = data.compressorInventoryItems.flatMap(compressor =>
    originalProfiles.map(profile => ({ ...clone(profile), compressorId: compressor.itemId })),
  );
  data.systemInformation.trimSelections = (data.compressedAirDayTypes ?? []).map(dayType => ({
    dayTypeId: dayType.dayTypeId,
    compressorId: data.compressorInventoryItems[0].itemId,
  }));
  data.modifications = [];
  fixture.coverageTags = [
    'compressor-type:6', 'control-type:7', 'control-type:8', 'control-type:10',
    'interval:1', 'profile-type:percentCapacity', 'synthetic',
  ];
  return fixture;
}

function createMetricLoadSharing(
  realFixtures: CompressedAirRegressionTestFixture[],
  convertCompressedAirService: ConvertCompressedAirService,
): CompressedAirRegressionTestFixture {
  // Covers Metric conversion, measured airflow, load sharing, and 15-minute rows.
  const fixture = cloneFixture(findFixture(realFixtures, 'ca-real-008'), 'ca-synthetic-003');
  const data = fixture.assessment.compressedAirAssessment;
  const oldSettings = clone(fixture.settings);
  const metricSettings = { ...clone(fixture.settings), unitsOfMeasure: 'Metric' };
  fixture.assessment.compressedAirAssessment = convertCompressedAirService.convertCompressedAir(
    data,
    oldSettings,
    metricSettings,
  );
  const metricData = fixture.assessment.compressedAirAssessment;
  metricData.systemInformation.multiCompressorSystemControls = 'loadSharing';
  setProfileDataType(metricData, 'airflow');
  setProfileValuesFromRatedCapacity(metricData, 'airflow', .5);
  setInterval(metricData, .25);
  fixture.settings = metricSettings;
  fixture.coverageTags = [
    'interval:0.25', 'profile-type:airflow', 'system-control:loadSharing', 'units:Metric', 'synthetic',
  ];
  return fixture;
}

function createCascadingReplacement(realFixtures: CompressedAirRegressionTestFixture[]): CompressedAirRegressionTestFixture {
  // Covers ordered cascading/replacement EEMs with percent-power input. Keep
  // this at one-hour intervals so the separate known sub-hour pressure-indexing
  // bug cannot prevent these EEMs from producing results.
  const fixture = cloneFixture(findFixture(realFixtures, 'ca-real-002'), 'ca-synthetic-004');
  const data = fixture.assessment.compressedAirAssessment;
  setProfileDataType(data, 'percentPower');
  setInterval(data, 1);
  const modification = data.modifications[0];
  modification.adjustCascadingSetPoints.order = 1;
  modification.replaceCompressor = {
    order: 2,
    implementationCost: 0,
    salvageValue: 0,
    currentCompressorMapping: [],
    replacementCompressorMapping: [],
    trimSelections: [],
  };
  modification.reduceAirLeaks.order = 100;
  modification.reduceSystemAirPressure.order = 100;
  const replacement = clone(data.compressorInventoryItems[0]);
  replacement.itemId = `${fixture.fixtureId}-replacement-01`;
  replacement.name = 'Replacement Compressor 1';
  data.replacementCompressorInventoryItems = [replacement];
  modification.replaceCompressor.currentCompressorMapping = data.compressorInventoryItems.map((compressor, index) => ({
    originalCompressorId: compressor.itemId,
    isReplaced: index === 0,
  }));
  modification.replaceCompressor.replacementCompressorMapping = [{
    replacementCompressorId: replacement.itemId,
    isAdded: true,
  }];
  modification.replaceCompressor.trimSelections = data.compressedAirDayTypes.map(dayType => ({
    dayTypeId: dayType.dayTypeId,
    compressorId: replacement.itemId,
  }));
  fixture.coverageTags = [
    'eem:adjust-cascading-set-points', 'eem:replace-compressor', 'interval:1',
    'profile-type:percentPower', 'synthetic',
  ];
  return fixture;
}

function createTwentyFourHourBoundaries(realFixtures: CompressedAirRegressionTestFixture[]): CompressedAirRegressionTestFixture {
  // Preserves current zero-savings and insufficient-capacity boundary behavior.
  const fixture = cloneFixture(findFixture(realFixtures, 'ca-real-025'), 'ca-synthetic-005');
  const data = fixture.assessment.compressedAirAssessment;
  setInterval(data, 24);
  setProfileDataType(data, 'percentCapacity');
  for (const profile of data.systemProfile.profileSummary) {
    profile.profileSummaryData[0].percentCapacity = 250;
  }
  deactivateEems(data.modifications[0]);
  fixture.coverageTags = ['insufficient-capacity', 'interval:24', 'zero-savings', 'synthetic'];
  return fixture;
}

function createHalfHourPercentPower(realFixtures: CompressedAirRegressionTestFixture[]): CompressedAirRegressionTestFixture {
  // Covers 30-minute percent-power profiles without invoking the known sub-hour
  // cascading pressure-indexing bug tracked separately from this framework.
  const fixture = cloneFixture(findFixture(realFixtures, 'ca-real-002'), 'ca-synthetic-006');
  const data = fixture.assessment.compressedAirAssessment;
  setProfileDataType(data, 'percentPower');
  setInterval(data, .5);
  deactivateEems(data.modifications[0]);
  fixture.coverageTags = ['interval:0.5', 'profile-type:percentPower', 'synthetic'];
  return fixture;
}

function deactivateEems(modification: any): void {
  if (!modification) return;
  for (const key of [
    'addPrimaryReceiverVolume', 'adjustCascadingSetPoints', 'improveEndUseEfficiency',
    'reduceAirLeaks', 'reduceRuntime', 'reduceSystemAirPressure', 'useAutomaticSequencer',
    'replaceCompressor',
  ]) {
    if (modification[key]) modification[key].order = 100;
  }
}

function setProfileDataType(compressedAirAssessment: any, profileDataType: string): void {
  compressedAirAssessment.systemProfile.systemProfileSetup.profileDataType = profileDataType;
  for (const dayType of compressedAirAssessment.compressedAirDayTypes ?? []) {
    dayType.profileDataType = profileDataType;
  }
}

function setProfileValuesFromRatedCapacity(
  compressedAirAssessment: any,
  field: 'airflow' | 'percentCapacity',
  capacityFraction: number,
): void {
  const compressorsById = new Map(
    compressedAirAssessment.compressorInventoryItems
      .map(compressor => [compressor.itemId, compressor]),
  );
  for (const profile of compressedAirAssessment.systemProfile.profileSummary) {
    const compressor: any = compressorsById.get(profile.compressorId);
    const value = field === 'airflow'
      ? compressor.nameplateData.fullLoadRatedCapacity * capacityFraction
      : capacityFraction * 100;
    for (const row of profile.profileSummaryData) row[field] = value;
  }
}

function setInterval(compressedAirAssessment: any, interval: .25 | .5 | 1 | 24): void {
  compressedAirAssessment.systemProfile.systemProfileSetup.dataInterval = interval;
  compressedAirAssessment.systemProfile.systemProfileSetup.numberOfHours = 24;
  for (const profile of compressedAirAssessment.systemProfile.profileSummary) {
    const sourceRows = clone(profile.profileSummaryData);
    profile.profileSummaryData = [];
    for (let time = 0; time < 24; time += interval) {
      const source = sourceRows.find(row => row.timeInterval === Math.floor(time)) ?? sourceRows[0];
      profile.profileSummaryData.push({ ...clone(source), timeInterval: time });
    }
  }
}

function cloneProfileForCompressor(compressedAirAssessment: any, sourceId: string, destinationId: string): void {
  const profiles = compressedAirAssessment.systemProfile.profileSummary
    .filter(profile => profile.compressorId === sourceId)
    .map(profile => ({ ...clone(profile), compressorId: destinationId }));
  compressedAirAssessment.systemProfile.profileSummary.push(...profiles);
}

function cloneFixture(source: CompressedAirRegressionTestFixture, fixtureId: string): CompressedAirRegressionTestFixture {
  const fixture = clone(source);
  fixture.fixtureId = fixtureId;
  fixture.source = 'synthetic';
  fixture.assessment.name = fixtureId;
  fixture.assessment.compressedAirAssessment.name = fixtureId;
  return fixture;
}

function findFixture(fixtures: CompressedAirRegressionTestFixture[], fixtureId: string): CompressedAirRegressionTestFixture {
  const fixture = fixtures.find(item => item.fixtureId === fixtureId);
  if (!fixture) throw new Error(`Synthetic fixture source ${fixtureId} is missing.`);
  return fixture;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
