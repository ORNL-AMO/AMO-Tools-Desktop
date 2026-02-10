import { Component, OnInit, Input, ViewChild, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
// import { LightingFixtures } from '../../../shared/models/materials';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { firstValueFrom, Subscription } from 'rxjs';
import { CustomMaterialsService } from '../custom-materials.service';
import { LightingSuiteApiService } from '../../../tools-suite-api/lighting-suite-api.service';
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
        this.lightingFixtureCategories = new Array<{ category: number, label: string, fixturesData: Array<any> }>();
        this.getCustomMaterials();
        // this.selectedSub = this.customMaterialService.getSelected.subscribe((val) => {
        //     if (val) {
        //     this.getSelected();
        //     }
        // });
    
        // this.selectAllSub = this.customMaterialService.selectAll.subscribe(val => {
        //     this.selectAll(val);
        // });
    }

    constructor( private customMaterialService: CustomMaterialsService,
        private lightingSuiteApiService: LightingSuiteApiService) {}

    async getCustomMaterials() {
        this.lightingFixtureCategories = this.lightingSuiteApiService.getLightingSystems();
        this.emitNumMaterials.emit(this.lightingFixtureCategories.length);
        
    }

    ngOnDestroy() {
        this.selectAllSub.unsubscribe();
        this.selectedSub.unsubscribe();
    }

    // selectAll(val: boolean) {
    // this.lightingFixtureCategories.forEach(fixture => {
    //   fixture.selected = val;
    // });

    // what is the shape of the data object. that is it recieving.

    // likely an array of lighting fixtures. what can i do with that data

    // The lighting data does not match the shape I am expecting.

}