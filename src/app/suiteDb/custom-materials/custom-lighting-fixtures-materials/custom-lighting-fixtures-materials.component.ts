import { Component, OnInit, Input, ViewChild, SimpleChanges, EventEmitter, Output } from "@angular/core";
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
    existingMaterial: any = null; // LightingFixtureData
    deletingMaterial: boolean = false;
    selectedCategory: any = null;

    @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
    selectedSub: Subscription;
    selectAllSub: Subscription;
    lightingMaterials: Array<{ category: number, label: string, fixturesData: Array<any> }> = [];
    customCategory: any = null;

    ngOnInit() {
        const allCategories = this.lightingSuiteApiService.setLightingSystemServiceState();
        // Only show the 'Custom' category (category: 0 or label: 'Custom')
        this.customCategory = allCategories.find(cat => cat.label === 'Custom' || cat.category === 0);
        this.lightingMaterials = this.customCategory ? [this.customCategory] : [];
    }

    constructor( private customMaterialService: CustomMaterialsService,
    private lightingSuiteApiService: LightingSuiteApiService) {}


    ngOnChanges(changes: SimpleChanges) {
        if (changes.showModal && !changes.showModal.firstChange) {
            if (changes.showModal.currentValue !== changes.showModal.previousValue) {
            this.showMaterialModal();
            }
        }
        if (changes.importing) {
            if (changes.importing.currentValue === false && changes.importing.previousValue === true) {
            this.getCustomMaterials();
            }
        }
    }


    showMaterialModal() {
        this.showModal = true;
        this.materialModal.show();
    }

    editMaterial(categoryIdx: number, fixtureIdx: number) {
        this.selectedCategory = this.lightingMaterials[categoryIdx];
        console.log(this.lightingMaterials[categoryIdx], this.lightingMaterials[categoryIdx].fixturesData[fixtureIdx]);
        this.existingMaterial = this.lightingMaterials[categoryIdx].fixturesData[fixtureIdx];
        this.editExistingMaterial = true;
        this.deletingMaterial = false;
        this.showMaterialModal();
    }

    deleteMaterial(categoryIdx: number, fixtureIdx: number) {
        this.selectedCategory = this.lightingMaterials[categoryIdx];
        this.existingMaterial = this.lightingMaterials[categoryIdx].fixturesData[fixtureIdx];
        this.editExistingMaterial = true;
        this.deletingMaterial = true;
        this.showMaterialModal();
    }


        hideMaterialModal(event?: any) {
                this.materialModal.hide();
                this.showModal = false;
                this.editExistingMaterial = false;
                this.deletingMaterial = false;
                this.existingMaterial = null;
                this.selectedCategory = null;
                this.getCustomMaterials();
        }
    
    getSelected() {
        // let selected: Array<{ category: number, label: string, fixturesData: Array<any> }> = _.filter(this.lightingMaterials, (material) => { return material.selected === true; });
        // this.customMaterialService.selectedFlueGas = selected;
        // add way to be selected
    }

    selectAll(val: boolean) {
        // this.lightingMaterials.forEach(material => {
        //     material.selected = val;
        // });
        //continue way to be selected.
    }

    async getCustomMaterials() {
        const allCategories = this.lightingSuiteApiService.lightingFixtureCategories;
        this.customCategory = allCategories.find(cat => cat.label === 'Custom' || cat.category === 0);
        this.lightingMaterials = this.customCategory ? [this.customCategory] : [];
        this.emitNumMaterials.emit(this.lightingMaterials.length);
        console.log(this.lightingMaterials);
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