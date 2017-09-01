import { NgModule } from '@angular/core';
import { WindowRefService } from './window-ref.service';
import { IndexedDbService } from './indexed-db.service';
@NgModule({
    providers: [
        WindowRefService,
        IndexedDbService
    ],
})

export class IndexedDbModule { }