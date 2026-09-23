import { createHash } from 'node:crypto';

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

export function isCompleteCompressedAirAssessment(assessment, settingsByAssessmentId) {
  const compressedAir = assessment?.compressedAirAssessment;
  return assessment?.type === 'CompressedAir'
    && compressedAir?.setupDone === true
    && Array.isArray(compressedAir.compressorInventoryItems)
    && compressedAir.compressorInventoryItems.length > 0
    && Array.isArray(compressedAir.systemProfile?.profileSummary)
    && compressedAir.systemProfile.profileSummary.length > 0
    && settingsByAssessmentId.has(assessment.id);
}

export function sanitizeBackup(backup) {
  const settingsByAssessmentId = new Map(
    (backup.settings ?? [])
      .filter(settings => settings.assessmentId !== undefined && settings.assessmentId !== null)
      .map(settings => [settings.assessmentId, settings]),
  );

  const complete = (backup.assessments ?? [])
    .filter(assessment => isCompleteCompressedAirAssessment(assessment, settingsByAssessmentId));
  const sensitiveValues = new Set(complete.flatMap(assessment => [
    ...collectSensitiveStrings(assessment),
    ...collectSensitiveSettingStrings(settingsByAssessmentId.get(assessment.id)),
  ]));

  const fixtures = complete.map((assessment, index) => sanitizeAssessment(
    assessment,
    settingsByAssessmentId.get(assessment.id),
    `ca-real-${String(index + 1).padStart(3, '0')}`,
  ));

  const privacy = verifyPrivacy(fixtures, sensitiveValues);
  if (!privacy.valid) {
    throw new Error(`Sanitized fixture privacy validation failed: ${privacy.errors.join('; ')}`);
  }

  const coreFixtureIds = selectCoreFixtureIds(fixtures, 7);
  return {
    corpus: {
      schemaVersion: 1,
      sourceAppVersion: uniqueValue(complete.map(assessment => assessment.appVersion)) ?? 'unknown',
      fixtures,
    },
    coverage: {
      schemaVersion: 1,
      realFixtureCount: fixtures.length,
      coreFixtureIds,
      tags: countTags(fixtures),
      corpusSha256: sha256(fixtures),
    },
  };
}

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
    source: 'sanitized-backup',
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
}

function createIdMap(items, key, prefix) {
  return new Map(items.map((item, index) => [item[key], `${prefix}-${String(index + 1).padStart(2, '0')}`]));
}

function mapId(map, value) {
  if (value === undefined || value === null || value === '') return value;
  return map.get(value) ?? value;
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
  }

  const profileRows = (compressedAir.systemProfile?.profileSummary ?? [])
    .flatMap(profile => profile.profileSummaryData ?? []);
  if (profileRows.some(row => typeof row.powerFactor === 'number' && row.powerFactor > 0 && row.powerFactor < 1)) {
    tags.add('fractional-power-factor');
  }
  return [...tags].sort();
}

export function selectCoreFixtureIds(fixtures, limit = 7) {
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

function uniqueValue(values) {
  const unique = [...new Set(values.filter(Boolean))];
  return unique.length === 1 ? unique[0] : undefined;
}

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
    compressedAir.systemInformation?.co2SavingsData?.zipcode,
    compressedAir.systemInformation?.co2SavingsData?.eGridRegion,
    compressedAir.systemInformation?.co2SavingsData?.eGridSubregion,
  ];
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

export function compareSnapshots(expected, actual, tolerance = 1e-6) {
  const differences = [];
  compareValue(expected, actual, '$', differences, tolerance);
  return differences;
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
