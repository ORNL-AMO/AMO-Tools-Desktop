/**
 * Pure Node utilities shared by fixture addition and snapshot comparison.
 *
 * This file intentionally contains no Angular or Suite imports. It handles data
 * around the calculations, while the Karma runner owns real-WASM execution.
 * Keeping this layer pure lets privacy and comparison behavior run quickly in
 * node:test without starting a browser.
 */
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, resolve } from 'node:path';

const INACTIVE_EEM_ORDER = 100;

const EEM_FIELDS = [
  ['reduceAirLeaks', 'eem:reduce-air-leaks'],
  ['improveEndUseEfficiency', 'eem:improve-end-use-efficiency'],
  ['reduceSystemAirPressure', 'eem:reduce-system-pressure'],
  ['adjustCascadingSetPoints', 'eem:adjust-cascading-set-points'],
  ['useAutomaticSequencer', 'eem:automatic-sequencer'],
  ['reduceRuntime', 'eem:reduce-runtime'],
  ['addPrimaryReceiverVolume', 'eem:add-receiver-volume'],
  ['replaceCompressor', 'eem:replace-compressor'],
];

const COVERAGE_SCENARIOS = [
  ...[
    [1, 'Single-stage lubricant-injected rotary screw'],
    [2, 'Two-stage lubricant-injected rotary screw'],
    [3, 'Two-stage lubricant-free rotary screw'],
    [4, 'Single-stage reciprocating'],
    [5, 'Two-stage reciprocating'],
    [6, 'Multiple-stage centrifugal'],
  ].map(([value, name]) => ({ id: `compressor-type-${value}`, name, allOf: [`compressor-type:${value}`] })),
  ...[
    [1, 'Inlet modulation without unloading'],
    [2, 'Inlet modulation with unloading'],
    [3, 'Variable displacement with unloading'],
    [4, 'Load/unload'],
    [5, 'Multi-step unloading'],
    [6, 'Start/stop'],
    [7, 'Centrifugal butterfly modulation with blowoff'],
    [8, 'Centrifugal butterfly modulation with unloading'],
    [9, 'Centrifugal guide-vane modulation with blowoff'],
    [10, 'Centrifugal guide-vane modulation with unloading'],
    [11, 'Variable-frequency drive'],
  ].map(([value, name]) => ({ id: `control-type-${value}`, name, allOf: [`control-type:${value}`] })),
  ...[
    ['power', 'Measured power input'],
    ['percentCapacity', 'Percent-capacity input'],
    ['airflow', 'Measured-airflow input'],
    ['powerFactor', 'Electrical input'],
    ['percentPower', 'Percent-power input'],
  ].map(([value, name]) => ({ id: `profile-${value}`, name, allOf: [`profile-type:${value}`] })),
  ...[
    ['cascading', 'Cascading system control'],
    ['targetPressureSequencer', 'Target-pressure sequencer'],
    ['loadSharing', 'Load sharing'],
    ['baseTrim', 'Base/trim'],
  ].map(([value, name]) => ({ id: `system-control-${value}`, name, allOf: [`system-control:${value}`] })),
  ...[
    ['flow-reallocation', 'Flow reallocation'],
    ['reduce-air-leaks', 'Reduce air leaks'],
    ['improve-end-use-efficiency', 'Improve end-use efficiency'],
    ['reduce-system-pressure', 'Reduce system pressure'],
    ['adjust-cascading-set-points', 'Adjust cascading set points'],
    ['automatic-sequencer', 'Automatic sequencer'],
    ['reduce-runtime', 'Reduce runtime'],
    ['add-receiver-volume', 'Add receiver volume'],
    ['replace-compressor', 'Replace compressor'],
  ].map(([value, name]) => ({ id: `eem-${value}`, name, allOf: [`eem:${value}`] })),
  { id: 'multiple-day-types', name: 'Multiple day types', allOf: ['multiple-day-types'] },
  { id: 'one-hour-profile', name: 'One-hour profile', allOf: ['interval:1'] },
  { id: 'sub-hour-profile', name: 'Sub-hour profile', anyOf: ['interval:0.25', 'interval:0.5'] },
  { id: 'imperial-units', name: 'Imperial settings', allOf: ['units:Imperial'] },
  { id: 'metric-units', name: 'Metric settings', allOf: ['units:Metric'] },
  { id: 'fractional-power-factor', name: 'Fractional power factor', allOf: ['fractional-power-factor'] },
  { id: 'auxiliary-equipment', name: 'Auxiliary equipment', allOf: ['auxiliary-equipment'] },
  { id: 'demand-charge', name: 'Demand charge', allOf: ['demand-charge'] },
  { id: 'zero-savings', name: 'Zero savings', allOf: ['zero-savings'] },
  { id: 'insufficient-capacity', name: 'Insufficient capacity', allOf: ['insufficient-capacity'] },
  {
    id: 'sub-hour-with-eem',
    name: 'Sub-hour profile with an active EEM',
    anyOf: ['interval:0.25', 'interval:0.5'],
    anyPrefix: 'eem:',
    missingReason: 'Intentionally deferred because the existing sub-hour pressure-indexing defect can prevent EEM results.',
  },
  {
    id: 'metric-with-demand-charge',
    name: 'Metric assessment with a demand charge',
    allOf: ['units:Metric', 'demand-charge'],
    missingReason: 'Metric and demand-charge behavior are covered separately; the private corpus has no assessment combining them.',
  },
];

const SETTING_KEYS = [
  'unitsOfMeasure',
  'emissionsUnit',
  'co2SavingsEnergyType',
  'co2SavingsEnergySource',
  'co2SavingsFuelType',
  'totalEmissionOutputRate',
  'electricityUse',
  'eGridRegion',
  'eGridSubregion',
  'totalEmissionOutput',
  'totalFuelEmissionOutputRate',
  'userEnteredBaselineEmissions',
  'userEnteredModificationEmissions',
  'zipcode',
];

export function deepClone(value) {
  return structuredClone(value);
}

export function stableStringify(value, spacing = 2) {
  return JSON.stringify(sortObjectKeys(value), null, spacing) + '\n';
}

export function sortObjectKeys(value) {
  if (Array.isArray(value)) {
    return value.map(sortObjectKeys);
  }
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((result, key) => {
      result[key] = sortObjectKeys(value[key]);
      return result;
    }, {});
  }
  return Object.is(value, -0) ? 0 : value;
}

export function sha256(value) {
  return createHash('sha256').update(typeof value === 'string' ? value : stableStringify(value, 0)).digest('hex');
}

/**
 * Reconstructs the browser-facing corpus from the per-assessment JSON files.
 * The filename and embedded fixture ID must agree so a renamed or duplicated
 * file cannot silently change calculation order.
 */
export function loadFixtureCorpus(fixtureRoot) {
  const manifest = readJson(resolve(fixtureRoot, 'manifest.json'));
  const fixtures = loadFixtureFiles(resolve(fixtureRoot, 'assessments'));
  return {
    schemaVersion: manifest.schemaVersion,
    sourceAppVersion: manifest.sourceAppVersion,
    fixtures,
  };
}

/**
 * Loads one immutable expected-results snapshot. Provenance stays in the
 * manifest and is intentionally separate from the calculation payload.
 */
export function loadRegressionTestSnapshot(snapshotRoot, snapshotName) {
  const directory = resolve(snapshotRoot, snapshotName);
  const manifest = readJson(resolve(directory, 'manifest.json'));
  if (manifest.snapshotName !== snapshotName) {
    throw new Error(`Snapshot manifest name ${manifest.snapshotName} does not match directory ${snapshotName}.`);
  }
  const fixtures = loadFixtureFiles(directory, new Set(['manifest.json']));
  const fixtureIds = fixtures.map(fixture => fixture.fixtureId);
  if (stableStringify(fixtureIds, 0) !== stableStringify(manifest.fixtureIds, 0)) {
    throw new Error(`Snapshot ${snapshotName} fixture files do not match its manifest.`);
  }
  return {
    manifest,
    snapshot: {
      schemaVersion: manifest.schemaVersion,
      resultSchemaVersion: manifest.resultSchemaVersion,
      snapshotName: manifest.snapshotName,
      desktopApplicationVersion: manifest.desktopApplicationVersion,
      suitePackageVersion: manifest.suitePackageVersion,
      sourceMeasurVersion: manifest.sourceMeasurVersion,
      scope: manifest.scope,
      fixtures,
    },
  };
}

/**
 * Angular's test bundler requires static JSON imports. This small generated
 * registry is the browser equivalent of the Node directory loaders above; the
 * assessment and snapshot JSON files remain the reviewable source of truth.
 */
export function getBrowserFixtureRegistrySource(fixtureRoot) {
  const assessmentNames = readdirSync(resolve(fixtureRoot, 'assessments'))
    .filter(name => name.endsWith('.json'))
    .sort((a, b) => a.localeCompare(b));
  const snapshotRoot = resolve(fixtureRoot, 'snapshots');
  const snapshotNames = readdirSync(snapshotRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort((a, b) => a.localeCompare(b));

  const lines = [
    '/**',
    ' * Generated by the compressed-air regression-test tooling.',
    ' * Edit the per-fixture JSON files and regenerate this registry instead of editing it by hand.',
    ' */',
    "import fixtureManifest from './manifest.json';",
  ];
  assessmentNames.forEach((name, index) => {
    lines.push(`import assessment${index} from './assessments/${name}';`);
  });
  const snapshots = snapshotNames.map((snapshotName, snapshotIndex) => {
    const { manifest } = loadRegressionTestSnapshot(snapshotRoot, snapshotName);
    lines.push(`import snapshotManifest${snapshotIndex} from './snapshots/${snapshotName}/manifest.json';`);
    manifest.fixtureIds.forEach((fixtureId, fixtureIndex) => {
      lines.push(`import snapshot${snapshotIndex}Fixture${fixtureIndex} from './snapshots/${snapshotName}/${fixtureId}.json';`);
    });
    return { snapshotName, snapshotIndex, fixtureCount: manifest.fixtureIds.length };
  });
  lines.push('', 'export const regressionTestCorpus = {',
    '  schemaVersion: fixtureManifest.schemaVersion,',
    '  sourceAppVersion: fixtureManifest.sourceAppVersion,',
    `  fixtures: [${assessmentNames.map((_name, index) => `assessment${index}`).join(', ')}],`,
    '};', '', 'export const regressionTestSnapshots: Record<string, any> = {');
  for (const snapshot of snapshots) {
    const { snapshotName, snapshotIndex, fixtureCount } = snapshot;
    lines.push(
      `  '${snapshotName}': {`,
      `    schemaVersion: snapshotManifest${snapshotIndex}.schemaVersion,`,
      `    resultSchemaVersion: snapshotManifest${snapshotIndex}.resultSchemaVersion,`,
      `    snapshotName: snapshotManifest${snapshotIndex}.snapshotName,`,
      `    desktopApplicationVersion: snapshotManifest${snapshotIndex}.desktopApplicationVersion,`,
      `    suitePackageVersion: snapshotManifest${snapshotIndex}.suitePackageVersion,`,
      `    sourceMeasurVersion: snapshotManifest${snapshotIndex}.sourceMeasurVersion,`,
      `    scope: snapshotManifest${snapshotIndex}.scope,`,
      `    fixtures: [${Array.from({ length: fixtureCount }, (_value, index) => `snapshot${snapshotIndex}Fixture${index}`).join(', ')}],`,
      '  },',
    );
  }
  lines.push('};', '');
  return `${lines.join('\n')}\n`;
}

export function writeBrowserFixtureRegistry(fixtureRoot) {
  writeFileSync(resolve(fixtureRoot, 'fixture-registry.ts'), getBrowserFixtureRegistrySource(fixtureRoot));
}

function loadFixtureFiles(directory, excludedNames = new Set()) {
  const names = readdirSync(directory)
    .filter(name => name.endsWith('.json') && !excludedNames.has(name))
    .sort((a, b) => a.localeCompare(b));
  const fixtures = names.map(name => {
    const fixture = readJson(resolve(directory, name));
    const expectedId = basename(name, '.json');
    if (fixture.fixtureId !== expectedId) {
      throw new Error(`Fixture filename ${name} does not match embedded ID ${fixture.fixtureId ?? 'missing'}.`);
    }
    return fixture;
  });
  const ids = fixtures.map(fixture => fixture.fixtureId);
  if (new Set(ids).size !== ids.length) throw new Error(`Duplicate fixture IDs found in ${directory}.`);
  return fixtures;
}

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

export function isCompleteCompressedAirAssessment(assessment, settings) {
  const compressedAir = assessment?.compressedAirAssessment;
  return assessment?.type === 'CompressedAir'
    && compressedAir?.setupDone === true
    && Array.isArray(compressedAir.compressorInventoryItems)
    && compressedAir.compressorInventoryItems.length > 0
    && Array.isArray(compressedAir.systemProfile?.profileSummary)
    && compressedAir.systemProfile.profileSummary.length > 0
    && Boolean(settings);
}

/**
 * Finds calculation-ready compressed-air assessment/settings pairs in a normal
 * MEASUR assessment export. System-backup records deliberately are not handled:
 * this pipeline is for adding one deliberately exported assessment, not for
 * rebuilding the corpus from a database backup.
 */
export function findCompleteCompressedAirAssessments(exportedData) {
  return (exportedData?.assessments ?? [])
    .filter(entry => entry?.assessment && entry?.settings)
    .map(entry => ({ assessment: entry.assessment, settings: entry.settings }))
    .filter(({ assessment, settings }) => isCompleteCompressedAirAssessment(assessment, settings));
}

/**
 * Adds one private assessment export to an existing sanitized corpus.
 *
 * Existing fixtures are cloned and kept in their current order. The new source
 * is sanitized before it is compared, inspected, or returned; callers should
 * write only this returned corpus and coverage object to the repository.
 */
export function addFixtureToCorpus(existingCorpus, exportedData, syntheticFixtures = []) {
  const matches = findCompleteCompressedAirAssessments(exportedData);
  if (matches.length === 0) {
    throw new Error('The export does not contain one complete compressed-air assessment with matching settings.');
  }
  if (matches.length > 1) {
    throw new Error('The export contains multiple complete compressed-air assessments. Export one assessment and try again.');
  }

  const existingFixtures = deepClone(existingCorpus?.fixtures ?? []);
  const fixtureId = getNextRealFixtureId(existingFixtures);
  const { assessment, settings } = matches[0];
  const fixture = sanitizeAssessment(assessment, settings, fixtureId);
  const sensitiveValues = new Set([
    ...collectSensitiveStrings(assessment),
    ...collectSensitiveSettingStrings(settings),
  ]);

  const privacy = verifyPrivacy([fixture], sensitiveValues);
  if (!privacy.valid) {
    throw new Error(`Sanitized fixture privacy validation failed: ${privacy.errors.join('; ')}`);
  }

  for (const existing of existingFixtures) {
    const comparable = sanitizeAssessment(assessment, settings, existing.fixtureId);
    comparable.source = existing.source;
    if (stableStringify(comparable, 0) === stableStringify(existing, 0)) {
      throw new Error(`This assessment is already represented by ${existing.fixtureId}.`);
    }
  }

  const fixtures = [...existingFixtures, fixture];
  const finalPrivacy = verifyPrivacy(fixtures);
  if (!finalPrivacy.valid) {
    throw new Error(`Combined fixture privacy validation failed: ${finalPrivacy.errors.join('; ')}`);
  }

  const versions = [...new Set(fixtures
    .map(item => item.assessment?.appVersion)
    .filter(Boolean))].sort();
  const corpus = {
    ...deepClone(existingCorpus),
    schemaVersion: existingCorpus?.schemaVersion ?? 1,
    sourceAppVersion: versions.join(', ') || 'unknown',
    fixtures,
  };

  return {
    fixture,
    corpus,
    coverage: buildCoverage(fixtures, syntheticFixtures),
  };
}

export function buildCoverage(realFixtures, syntheticFixtures = []) {
  const syntheticCoverage = syntheticFixtures.map(fixture => ({
    fixtureId: fixture.fixtureId,
    coverageTags: [...fixture.coverageTags].sort(),
  }));
  const allFixtures = [...realFixtures, ...syntheticCoverage];
  const scenarios = COVERAGE_SCENARIOS.map(scenario => {
    const matchingFixtureIds = allFixtures
      .filter(fixture => matchesCoverageScenario(fixture.coverageTags, scenario))
      .map(fixture => fixture.fixtureId);
    return {
      id: scenario.id,
      name: scenario.name,
      status: matchingFixtureIds.length > 0 ? 'covered' : 'missing',
      matchingFixtureIds,
      expectedTags: {
        allOf: scenario.allOf ?? [],
        anyOf: scenario.anyOf ?? [],
        anyPrefix: scenario.anyPrefix ?? null,
      },
      ...(matchingFixtureIds.length === 0 && scenario.missingReason
        ? { missingReason: scenario.missingReason }
        : {}),
    };
  });
  return {
    schemaVersion: 2,
    realFixtureCount: realFixtures.length,
    syntheticFixtureCount: syntheticCoverage.length,
    totalFixtureCount: allFixtures.length,
    coreFixtureIds: selectCoreFixtureIds(allFixtures),
    realFixtures: realFixtures.map(fixture => ({
      fixtureId: fixture.fixtureId,
      coverageTags: [...fixture.coverageTags].sort(),
      sha256: sha256(fixture),
    })),
    realTags: countTags(realFixtures),
    syntheticTags: countTags(syntheticCoverage),
    tags: countTags(allFixtures),
    syntheticFixtures: syntheticCoverage,
    scenarios,
    missingScenarios: scenarios
      .filter(scenario => scenario.status === 'missing')
      .map(scenario => scenario.id),
    corpusSha256: sha256(realFixtures),
  };
}

function matchesCoverageScenario(tags, scenario) {
  const tagSet = new Set(tags);
  const hasAll = (scenario.allOf ?? []).every(tag => tagSet.has(tag));
  const hasAny = !scenario.anyOf || scenario.anyOf.some(tag => tagSet.has(tag));
  const hasPrefix = !scenario.anyPrefix || tags.some(tag => tag.startsWith(scenario.anyPrefix));
  return hasAll && hasAny && hasPrefix;
}

function getNextRealFixtureId(fixtures) {
  const highest = fixtures.reduce((maximum, fixture) => {
    const match = /^ca-real-(\d+)$/.exec(fixture.fixtureId);
    return match ? Math.max(maximum, Number(match[1])) : maximum;
  }, 0);
  return `ca-real-${String(highest + 1).padStart(3, '0')}`;
}

/**
 * Sanitizes one calculation-ready assessment and remaps every retained internal
 * reference to deterministic IDs. Numeric and boolean calculation inputs remain
 * unchanged; names, notes, dates, locations, source IDs, and Log Tool links do
 * not cross the private-export boundary.
 */
export function sanitizeAssessment(assessment, settings, fixtureId) {
  const source = deepClone(assessment);
  const compressedAir = source.compressedAirAssessment;
  delete compressedAir.logToolData;

  const compressorIdMap = createIdMap(
    compressedAir.compressorInventoryItems ?? [],
    'itemId',
    `${fixtureId}-compressor`,
  );
  const replacementIdMap = createIdMap(
    compressedAir.replacementCompressorInventoryItems ?? [],
    'itemId',
    `${fixtureId}-replacement`,
  );
  const allCompressorIds = new Map([...compressorIdMap, ...replacementIdMap]);
  const dayTypeIdMap = createIdMap(
    compressedAir.compressedAirDayTypes ?? [],
    'dayTypeId',
    `${fixtureId}-day-type`,
  );
  const modificationIdMap = createIdMap(
    compressedAir.modifications ?? [],
    'modificationId',
    `${fixtureId}-modification`,
  );
  const endUseIdMap = createIdMap(
    compressedAir.endUseData?.endUses ?? [],
    'endUseId',
    `${fixtureId}-end-use`,
  );

  sanitizeCompressors(compressedAir.compressorInventoryItems ?? [], compressorIdMap, 'Compressor');
  sanitizeCompressors(compressedAir.replacementCompressorInventoryItems ?? [], replacementIdMap, 'Replacement Compressor');

  (compressedAir.compressedAirDayTypes ?? []).forEach((dayType, index) => {
    dayType.dayTypeId = mapId(dayTypeIdMap, dayType.dayTypeId);
    dayType.name = `Day Type ${index + 1}`;
  });

  compressedAir.name = fixtureId;
  if (compressedAir.systemBasics) compressedAir.systemBasics.notes = '';
  sanitizeSystemInformation(compressedAir.systemInformation, allCompressorIds, dayTypeIdMap);
  sanitizeSystemProfile(compressedAir.systemProfile, allCompressorIds, dayTypeIdMap);
  sanitizeEndUses(compressedAir.endUseData, endUseIdMap, dayTypeIdMap);
  sanitizeModifications(
    compressedAir.modifications ?? [],
    modificationIdMap,
    allCompressorIds,
    dayTypeIdMap,
  );

  const sanitizedAssessment = {
    appVersion: source.appVersion,
    compressedAirAssessment: compressedAir,
    name: fixtureId,
    type: 'CompressedAir',
  };

  return {
    fixtureId,
    source: 'sanitized-export',
    coverageTags: getCoverageTags(compressedAir, settings),
    assessment: sanitizedAssessment,
    settings: sanitizeSettings(settings),
  };
}

function sanitizeCompressors(compressors, idMap, label) {
  compressors.forEach((compressor, index) => {
    compressor.itemId = mapId(idMap, compressor.itemId);
    compressor.name = `${label} ${index + 1}`;
    compressor.description = '';
    compressor.modifiedDate = '2000-01-01T00:00:00.000Z';
    delete compressor.compressorLibId;
  });
}

function sanitizeSystemInformation(systemInformation, compressorIdMap, dayTypeIdMap) {
  if (!systemInformation) return;
  (systemInformation.trimSelections ?? []).forEach(selection => {
    selection.dayTypeId = mapId(dayTypeIdMap, selection.dayTypeId);
    selection.compressorId = mapId(compressorIdMap, selection.compressorId);
  });
  sanitizeEmissionsData(systemInformation.co2SavingsData);
}

function sanitizeSystemProfile(systemProfile, compressorIdMap, dayTypeIdMap) {
  if (!systemProfile) return;
  if (systemProfile.systemProfileSetup) {
    systemProfile.systemProfileSetup.dayTypeId = mapId(dayTypeIdMap, systemProfile.systemProfileSetup.dayTypeId);
  }
  sanitizeProfileSummary(systemProfile.profileSummary ?? [], compressorIdMap, dayTypeIdMap);
}

function sanitizeProfileSummary(profileSummary, compressorIdMap, dayTypeIdMap) {
  profileSummary.forEach(profile => {
    profile.compressorId = mapId(compressorIdMap, profile.compressorId);
    profile.dayTypeId = mapId(dayTypeIdMap, profile.dayTypeId);
    delete profile.logToolFieldId;
    delete profile.logToolFieldIdPowerFactor;
    delete profile.logToolFieldIdAmps;
    delete profile.logToolFieldIdVolts;
    delete profile.profileSummaryForPrint;
  });
}

function sanitizeEndUses(endUseData, endUseIdMap, dayTypeIdMap) {
  if (!endUseData) return;
  const setup = endUseData.endUseDayTypeSetup;
  if (setup) {
    setup.selectedDayTypeId = mapId(dayTypeIdMap, setup.selectedDayTypeId);
    (setup.dayTypeLeakRates ?? []).forEach(rate => {
      rate.dayTypeId = mapId(dayTypeIdMap, rate.dayTypeId);
    });
  }
  (endUseData.endUses ?? []).forEach((endUse, index) => {
    endUse.endUseId = mapId(endUseIdMap, endUse.endUseId);
    endUse.endUseName = `End Use ${index + 1}`;
    endUse.endUseDescription = '';
    endUse.location = '';
    endUse.modifiedDate = '2000-01-01T00:00:00.000Z';
    (endUse.dayTypeEndUses ?? []).forEach(dayTypeEndUse => {
      dayTypeEndUse.dayTypeId = mapId(dayTypeIdMap, dayTypeEndUse.dayTypeId);
      if ('dayTypeName' in dayTypeEndUse) dayTypeEndUse.dayTypeName = 'Sanitized Day Type';
    });
  });
}

function sanitizeModifications(modifications, modificationIdMap, compressorIdMap, dayTypeIdMap) {
  modifications.forEach((modification, index) => {
    modification.modificationId = mapId(modificationIdMap, modification.modificationId);
    modification.name = `Modification ${index + 1}`;
    if ('notes' in modification) modification.notes = '';

    (modification.adjustCascadingSetPoints?.setPointData ?? []).forEach(setPoint => {
      setPoint.compressorId = mapId(compressorIdMap, setPoint.compressorId);
    });
    (modification.reduceRuntime?.runtimeData ?? []).forEach(runtime => {
      runtime.compressorId = mapId(compressorIdMap, runtime.compressorId);
      runtime.dayTypeId = mapId(dayTypeIdMap, runtime.dayTypeId);
    });
    sanitizeProfileSummary(
      modification.useAutomaticSequencer?.profileSummary ?? [],
      compressorIdMap,
      dayTypeIdMap,
    );
    (modification.improveEndUseEfficiency?.endUseEfficiencyItems ?? []).forEach((item, itemIndex) => {
      item.name = `Efficiency Item ${itemIndex + 1}`;
      (item.reductionData ?? []).forEach(reduction => {
        reduction.dayTypeId = mapId(dayTypeIdMap, reduction.dayTypeId);
        if ('dayTypeName' in reduction) reduction.dayTypeName = 'Sanitized Day Type';
      });
    });

    const replacement = modification.replaceCompressor;
    if (replacement) {
      (replacement.currentCompressorMapping ?? []).forEach(mapping => {
        mapping.originalCompressorId = mapId(compressorIdMap, mapping.originalCompressorId);
      });
      (replacement.replacementCompressorMapping ?? []).forEach(mapping => {
        mapping.replacementCompressorId = mapId(compressorIdMap, mapping.replacementCompressorId);
      });
      (replacement.trimSelections ?? []).forEach(selection => {
        selection.dayTypeId = mapId(dayTypeIdMap, selection.dayTypeId);
        selection.compressorId = mapId(compressorIdMap, selection.compressorId);
      });
    }
  });
}

function sanitizeSettings(settings) {
  const sanitized = {};
  for (const key of SETTING_KEYS) {
    if (key in settings) sanitized[key] = deepClone(settings[key]);
  }
  sanitized.unitsOfMeasure ??= 'Imperial';
  sanitized.emissionsUnit ??= 'Metric';
  sanitized.co2SavingsEnergySource = 'Sanitized';
  sanitized.co2SavingsFuelType = 'Sanitized';
  sanitized.eGridRegion = 'Sanitized';
  sanitized.eGridSubregion = 'Sanitized';
  sanitized.zipcode = '00000';
  return sanitized;
}

function sanitizeEmissionsData(data) {
  if (!data) return;
  data.energySource = 'Sanitized';
  data.fuelType = 'Sanitized';
  data.eGridRegion = 'Sanitized';
  data.eGridSubregion = 'Sanitized';
  data.zipcode = '00000';
  (data.otherFuelMixedCO2SavingsData ?? []).forEach(sanitizeEmissionsData);
}

function createIdMap(items, key, prefix) {
  return new Map(items.map((item, index) => [item[key], `${prefix}-${String(index + 1).padStart(2, '0')}`]));
}

function mapId(map, value) {
  if (value === undefined || value === null || value === '') return value;
  if (!map.has(value)) {
    throw new Error('A retained fixture reference does not match a retained assessment record.');
  }
  return map.get(value);
}

export function getCoverageTags(compressedAir, settings) {
  const tags = new Set();
  for (const compressor of compressedAir.compressorInventoryItems ?? []) {
    tags.add(`compressor-type:${compressor.nameplateData?.compressorType}`);
    tags.add(`control-type:${compressor.compressorControls?.controlType}`);
  }
  tags.add(`system-control:${compressedAir.systemInformation?.multiCompressorSystemControls ?? 'missing'}`);
  tags.add(`profile-type:${compressedAir.systemProfile?.systemProfileSetup?.profileDataType ?? 'missing'}`);
  tags.add(`interval:${compressedAir.systemProfile?.systemProfileSetup?.dataInterval ?? 'missing'}`);
  tags.add(`units:${settings?.unitsOfMeasure ?? 'missing'}`);
  if ((compressedAir.compressedAirDayTypes ?? []).length > 1) tags.add('multiple-day-types');
  if ((compressedAir.compressorInventoryItems ?? []).length === 1) tags.add('single-compressor');
  if ((compressedAir.compressorInventoryItems ?? []).length >= 6) tags.add('large-system');
  if ((compressedAir.modifications ?? []).length > 1) tags.add('multiple-modifications');
  if ((compressedAir.systemBasics?.demandCost ?? 0) !== 0) tags.add('demand-charge');

  for (const modification of compressedAir.modifications ?? []) {
    tags.add('eem:flow-reallocation');
    for (const [field, tag] of EEM_FIELDS) {
      if (modification[field] && modification[field].order < INACTIVE_EEM_ORDER) tags.add(tag);
    }
    if (modification.improveEndUseEfficiency?.order < INACTIVE_EEM_ORDER
      && (modification.improveEndUseEfficiency.endUseEfficiencyItems ?? [])
        .some(item => item.substituteAuxiliaryEquipment)) {
      tags.add('auxiliary-equipment');
    }
  }

  const profileRows = (compressedAir.systemProfile?.profileSummary ?? [])
    .flatMap(profile => profile.profileSummaryData ?? []);
  if (profileRows.some(row => typeof row.powerFactor === 'number' && row.powerFactor > 0 && row.powerFactor < 1)) {
    tags.add('fractional-power-factor');
  }
  return [...tags].sort();
}

/**
 * Greedy set-cover selection for the fast test set. Sorting by fixture ID makes
 * ties deterministic, so refreshing coverage produces the same core cases.
 * The full command always runs every real and synthetic fixture.
 */
export function selectCoreFixtureIds(fixtures, limit = Number.POSITIVE_INFINITY) {
  const uncovered = new Set(fixtures.flatMap(fixture => fixture.coverageTags));
  const selected = [];
  const candidates = [...fixtures].sort((a, b) => a.fixtureId.localeCompare(b.fixtureId));

  while (uncovered.size > 0 && selected.length < limit) {
    let best;
    let bestCoverage = [];
    for (const candidate of candidates) {
      if (selected.includes(candidate)) continue;
      const coverage = candidate.coverageTags.filter(tag => uncovered.has(tag));
      if (coverage.length > bestCoverage.length) {
        best = candidate;
        bestCoverage = coverage;
      }
    }
    if (!best || bestCoverage.length === 0) break;
    selected.push(best);
    bestCoverage.forEach(tag => uncovered.delete(tag));
  }

  if (uncovered.size > 0) {
    throw new Error(`Core fixture limit ${limit} does not cover: ${[...uncovered].sort().join(', ')}`);
  }
  return selected.map(fixture => fixture.fixtureId);
}

function countTags(fixtures) {
  const counts = {};
  for (const fixture of fixtures) {
    for (const tag of fixture.coverageTags) counts[tag] = (counts[tag] ?? 0) + 1;
  }
  return Object.fromEntries(Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)));
}

/**
 * Final defense before sanitized data can be written or committed. Common
 * database/backup fields are forbidden for every module; sensitiveValues adds
 * strings collected from this particular private source so accidental leakage
 * is caught even when it appears under an otherwise allowed key.
 */
export function verifyPrivacy(fixtures, sensitiveValues = new Set()) {
  const errors = [];
  const forbiddenKeys = new Set([
    'logToolData',
    'facilityInfo',
    'dataBackupFilePath',
    'filename',
    'directoryId',
    'assessmentId',
    'inventoryId',
    'diagramId',
  ]);

  walk(fixtures, [], (key, value, path) => {
    if (forbiddenKeys.has(key)) errors.push(`forbidden key ${path.join('.')}`);
    if (typeof value === 'string' && value.includes('OneDrive')) errors.push(`private path at ${path.join('.')}`);
  });

  const sanitizedStrings = new Set();
  collectStringLeaves(fixtures, sanitizedStrings);
  for (const sensitiveValue of sensitiveValues) {
    if (sensitiveValue.length >= 4
      && !isGenericSanitizedValue(sensitiveValue)
      && sanitizedStrings.has(sensitiveValue)) {
      errors.push('source identifying value remained after sanitization');
      break;
    }
  }

  return { valid: errors.length === 0, errors };
}

function collectStringLeaves(value, strings) {
  if (typeof value === 'string') {
    strings.add(value);
    return;
  }
  if (Array.isArray(value)) {
    value.forEach(item => collectStringLeaves(item, strings));
    return;
  }
  if (value && typeof value === 'object') {
    Object.values(value).forEach(child => collectStringLeaves(child, strings));
  }
}

function isGenericSanitizedValue(value) {
  return value === 'Sanitized'
    || value === 'Sanitized Day Type'
    || value === '00000'
    || /^ca-real-\d+$/.test(value)
    || /^(Compressor|Replacement Compressor|Day Type|Modification|End Use|Efficiency Item) \d+$/.test(value);
}

function collectSensitiveStrings(assessment) {
  const compressedAir = assessment.compressedAirAssessment ?? {};
  const values = [
    assessment.name,
    compressedAir.name,
    compressedAir.systemBasics?.notes,
  ];
  collectSensitiveEmissionsStrings(compressedAir.systemInformation?.co2SavingsData, values);
  for (const compressor of [
    ...(compressedAir.compressorInventoryItems ?? []),
    ...(compressedAir.replacementCompressorInventoryItems ?? []),
  ]) {
    values.push(compressor.name, compressor.description);
  }
  for (const dayType of compressedAir.compressedAirDayTypes ?? []) values.push(dayType.name);
  for (const modification of compressedAir.modifications ?? []) {
    values.push(modification.name, modification.notes);
    for (const item of modification.improveEndUseEfficiency?.endUseEfficiencyItems ?? []) values.push(item.name);
  }
  for (const endUse of compressedAir.endUseData?.endUses ?? []) {
    values.push(endUse.endUseName, endUse.endUseDescription, endUse.location);
  }
  for (const field of compressedAir.logToolData?.logToolFields ?? []) {
    values.push(field.alias, field.csvName, field.fieldName);
  }
  return values.filter(value => typeof value === 'string' && value.trim() !== '');
}

function collectSensitiveEmissionsStrings(data, values) {
  if (!data) return;
  values.push(data.energySource, data.fuelType, data.eGridRegion, data.eGridSubregion, data.zipcode);
  (data.otherFuelMixedCO2SavingsData ?? [])
    .forEach(item => collectSensitiveEmissionsStrings(item, values));
}

function collectSensitiveSettingStrings(settings) {
  return [
    settings?.co2SavingsEnergySource,
    settings?.co2SavingsFuelType,
    settings?.eGridRegion,
    settings?.eGridSubregion,
    settings?.zipcode,
  ].filter(value => typeof value === 'string' && value.trim() !== '');
}

function walk(value, path, visit) {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walk(item, [...path, String(index)], visit));
    return;
  }
  if (!value || typeof value !== 'object') return;
  for (const [key, child] of Object.entries(value)) {
    const childPath = [...path, key];
    visit(key, child, childPath);
    walk(child, childPath, visit);
  }
}

/**
 * Compares current calculation results with an accepted snapshot.
 *
 * Object fields, array order/length, flags, strings, nulls, and special-value
 * representations are exact. Finite numbers use a hybrid tolerance of
 * tolerance * max(1, abs(expected)) so tiny floating-point drift does not hide
 * meaningful engineering changes or create noise near zero.
 */
export function compareSnapshots(expected, actual, tolerance = 1e-6) {
  const differences = [];
  compareValue(getComparableSnapshot(expected), getComparableSnapshot(actual), '$', differences, tolerance);
  return differences;
}

function getComparableSnapshot(snapshot) {
  if (!snapshot || typeof snapshot !== 'object' || Array.isArray(snapshot)) return snapshot;
  const comparable = { ...snapshot };
  delete comparable.snapshotName;
  delete comparable.desktopApplicationVersion;
  delete comparable.suitePackageVersion;
  delete comparable.sourceMeasurVersion;
  return comparable;
}

function compareValue(expected, actual, path, differences, tolerance) {
  if (typeof expected === 'number' && typeof actual === 'number') {
    if (!Number.isFinite(expected) || !Number.isFinite(actual)) {
      differences.push({ category: 'non-finite', path, expected: describeNonFinite(expected), actual: describeNonFinite(actual) });
      return;
    }
    const allowed = tolerance * Math.max(1, Math.abs(expected));
    const absoluteDelta = Math.abs(actual - expected);
    if (absoluteDelta > allowed) {
      differences.push({
        category: 'numeric',
        path,
        expected,
        actual,
        absoluteDelta,
        relativeDelta: expected === 0 ? null : absoluteDelta / Math.abs(expected),
        tolerance: allowed,
      });
    }
    return;
  }

  if (Array.isArray(expected) || Array.isArray(actual)) {
    if (!Array.isArray(expected) || !Array.isArray(actual)) {
      differences.push({ category: 'type', path, expected, actual });
      return;
    }
    if (expected.length !== actual.length) {
      differences.push({ category: 'array-length', path, expected: expected.length, actual: actual.length });
    }
    const length = Math.min(expected.length, actual.length);
    for (let index = 0; index < length; index++) {
      compareValue(expected[index], actual[index], `${path}[${index}]`, differences, tolerance);
    }
    return;
  }

  const expectedObject = expected && typeof expected === 'object';
  const actualObject = actual && typeof actual === 'object';
  if (expectedObject || actualObject) {
    if (!expectedObject || !actualObject) {
      differences.push({ category: 'type', path, expected, actual });
      return;
    }
    const keys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
    for (const key of [...keys].sort()) {
      if (!(key in expected)) {
        differences.push({ category: 'missing-expected-field', path: `${path}.${key}`, actual: actual[key] });
      } else if (!(key in actual)) {
        differences.push({ category: 'missing-actual-field', path: `${path}.${key}`, expected: expected[key] });
      } else {
        compareValue(expected[key], actual[key], `${path}.${key}`, differences, tolerance);
      }
    }
    return;
  }

  if (!Object.is(expected, actual)) {
    differences.push({ category: 'value', path, expected, actual });
  }
}

function describeNonFinite(value) {
  if (Number.isNaN(value)) return 'NaN';
  if (value === Infinity) return 'Infinity';
  if (value === -Infinity) return '-Infinity';
  return value;
}
