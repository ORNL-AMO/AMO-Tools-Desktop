import { of } from 'rxjs';
import { CopyItemsComponent, SelectedDirectoryData } from './copy-items.component';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { Directory } from '../../shared/models/directory';
import { Settings } from '../../shared/models/settings';

describe('CopyItemsComponent.copyDirectory', () => {
  let component: CopyItemsComponent;
  let directoryDbService: jasmine.SpyObj<DirectoryDbService>;

  beforeEach(() => {
    directoryDbService = jasmine.createSpyObj<DirectoryDbService>('DirectoryDbService', ['addWithObservable']);
    directoryDbService.addWithObservable.and.callFake((directory: Directory) => of({ ...directory, id: 99 }));
    const settingsDbService = jasmine.createSpyObj<SettingsDbService>('SettingsDbService', ['getByDirectoryId', 'addWithObservable']);
    settingsDbService.getByDirectoryId.and.returnValue({} as Settings);
    settingsDbService.addWithObservable.and.callFake((settings: Settings) => of(settings));

    // Only copyDirectory is under test; it uses the directory and settings services, nothing else from the constructor.
    component = new CopyItemsComponent(directoryDbService, null, null, null, null, null, null, null, null, settingsDbService, null);
    component.selectedDirData = { newDirectoryIdMap: {} } as SelectedDirectoryData;
  });

  it('saves a copy of the Examples folder as a user folder, not example data', async () => {
    await component.copyDirectory({ id: 2, name: 'Examples', parentDirectoryId: 1, isExample: true }, 1);

    const savedCopy: Directory = directoryDbService.addWithObservable.calls.mostRecent().args[0];
    expect(savedCopy.isExample).toBeFalse();
    expect(savedCopy.name).toBe('Examples (copy)');
  });
});
