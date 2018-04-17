import { NgModule } from '@angular/core';
import { WindowRefService } from './window-ref.service';
import { IndexedDbService } from './indexed-db.service';
import { AssessmentDbService } from './assessment-db.service';
import { DirectoryDbService } from './directory-db.service';
import { SettingsDbService } from './settings-db.service';
@NgModule({
    providers: [
        WindowRefService,
        IndexedDbService,
        AssessmentDbService,
        DirectoryDbService,
        SettingsDbService
    ],
})

export class IndexedDbModule { }