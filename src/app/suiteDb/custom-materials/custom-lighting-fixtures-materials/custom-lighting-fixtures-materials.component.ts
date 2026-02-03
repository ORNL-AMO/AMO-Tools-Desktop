import { Component, OnInit, Input, ViewChild, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
// import { LightingFixtures } from '../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { firstValueFrom, Subscription } from 'rxjs';
import { CustomMaterialsService } from '../custom-materials.service';
@Component({
    selector: 'app-custom-lighting-fixtures-materials',
    templateUrl: './custom-lighting-fixtures-materials.component.html',
    styleUrls: ['./custom-lighting-fixtures-materials.component.css'],
    standalone: false
}) export class CustomLightingFixturesMaterialsComponent implements OnInit {

    @Input()
    settings: Settings;
    @Input()
    showModal: boolean;
    @Input()
    importing: boolean;
    @Output()
    emitNumMaterials: EventEmitter<number> = new EventEmitter<number>();

    editExistingMaterial: boolean = false;
    // existingMaterial: LightingFixtures;
    deletingMaterial: boolean = false;

    @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
    selectedSub: Subscription;
    selectAllSub: Subscription;
    lightingFixtureCategories: Array<{ category: number, label: string, fixturesData: Array<any> }>;
    ngOnInit() {
        // this.wallLossesSurfaces = new Array<WallLossesSurface>();
    }

    constructor( private customMaterialService: CustomMaterialsService) {}

    async getCustomMaterials() {
        this.lightingFixtureCategories = await firstValueFrom(this.lightingSuiteApiService.getLightingSystems());
        this.emitNumMaterials.emit(this.lightingFixtureCategories.length);
    }
}