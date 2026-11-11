import { of } from 'rxjs';
import { ImportDirectory, ImportService } from './import.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { DiagramIdbService } from '../../indexedDb/diagram-idb.service';
import { CalculatorDbService } from '../../indexedDb/calculator-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { InventoryDbService } from '../../indexedDb/inventory-db.service';
import { Assessment } from '../models/assessment';
import { Calculator } from '../models/calculators';
import { Settings } from '../models/settings';

describe('ImportService', () => {
  it('links an imported folder assessment\'s calculator to the newly added assessment', async () => {
    const newAssessmentId = 42;
    const assessmentDbService = jasmine.createSpyObj<AssessmentDbService>('AssessmentDbService', ['addWithObservable', 'getAllAssessments', 'setAll']);
    assessmentDbService.addWithObservable.and.callFake((assessment: Assessment) => of({ ...assessment, id: newAssessmentId }));
    assessmentDbService.getAllAssessments.and.returnValue(of([]));
    const settingsDbService = jasmine.createSpyObj<SettingsDbService>('SettingsDbService', ['addWithObservable', 'getAllSettings', 'setAll']);
    settingsDbService.addWithObservable.and.callFake((settings: Settings) => of(settings));
    settingsDbService.getAllSettings.and.returnValue(of([]));
    const calculatorDbService = jasmine.createSpyObj<CalculatorDbService>('CalculatorDbService', ['addWithObservable', 'getAllCalculators', 'setAll']);
    calculatorDbService.addWithObservable.and.callFake((calculator: Calculator) => of(calculator));
    calculatorDbService.getAllCalculators.and.returnValue(of([]));
    const diagramIdbService = jasmine.createSpyObj<DiagramIdbService>('DiagramIdbService', ['getAllDiagrams', 'setAll']);
    diagramIdbService.getAllDiagrams.and.returnValue(of([]));

    const service = new ImportService(settingsDbService, {} as DirectoryDbService, diagramIdbService, calculatorDbService,
      assessmentDbService, {} as InventoryDbService);
    const importDirectory = {
      assessments: [{ assessment: { id: 5, name: 'Example pump' } as Assessment, settings: { id: 7 } as Settings, calculator: { id: 9, assessmentId: 5 } as Calculator }],
    } as ImportDirectory;

    await service.addImportDirectoryAssessments(importDirectory, 3);

    const addedCalculator: Calculator = calculatorDbService.addWithObservable.calls.mostRecent().args[0];
    expect(addedCalculator.assessmentId).toBe(newAssessmentId);
    expect(addedCalculator.directoryId).toBe(3);
  });
});
