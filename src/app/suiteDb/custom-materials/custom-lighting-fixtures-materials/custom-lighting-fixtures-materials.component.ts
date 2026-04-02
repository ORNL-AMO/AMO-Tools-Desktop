import { Component, OnInit, Input, ViewChild, SimpleChanges, EventEmitter, Output } from "@angular/core";
import { Settings } from '../../../shared/models/settings';
import { ModalDirective } from 'ngx-bootstrap/modal';
import { Subscription } from 'rxjs';
import { CustomMaterialsService } from '../custom-materials.service';
import { LightingFixtureServiceDbService } from '../../../indexedDb/lighting-fixture-db.service';
import { firstValueFrom } from 'rxjs';
import { LightingFixtureMaterial } from '../../../shared/models/materials';
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
    existingMaterial: LightingFixtureMaterial;
    deletingMaterial: boolean = false;

    @ViewChild('materialModal', { static: false }) public materialModal: ModalDirective;
    selectedSub: Subscription;
    selectAllSub: Subscription;
    lightingMaterials: Array<LightingFixtureMaterial> = [];

    ngOnInit() {
        this.lightingMaterials = new Array<LightingFixtureMaterial>();
        this.getCustomMaterials();
        this.selectedSub = this.customMaterialService.getSelected.subscribe((val) => {
            if (val) {
                this.getSelected();
            }
        });

        this.selectAllSub = this.customMaterialService.selectAll.subscribe(val => {
            this.selectAll(val);
        });
    }

    constructor( private customMaterialService: CustomMaterialsService,
    private lightingFixtureServiceDbService: LightingFixtureServiceDbService) {}


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

    async editMaterial(id: number) {
        this.existingMaterial = await firstValueFrom(this.lightingFixtureServiceDbService.getByIdWithObservable(id));
        this.editExistingMaterial = true;
        this.deletingMaterial = false;
        this.showMaterialModal();
    }

    async deleteMaterial(id: number) {
        this.existingMaterial = await firstValueFrom(this.lightingFixtureServiceDbService.getByIdWithObservable(id));
        this.editExistingMaterial = true;
        this.deletingMaterial = true;
        this.showMaterialModal();
    }


    hideMaterialModal(event?: any) {
        this.materialModal.hide();
        this.showModal = false;
        this.editExistingMaterial = false;
        this.deletingMaterial = false;
        this.getCustomMaterials();
    }
    
    getSelected() {
        let selected: Array<LightingFixtureMaterial> = this.lightingMaterials.filter(material => material.selected === true);
        this.customMaterialService.selectedLightingFixtures = selected;
    }

    selectAll(val: boolean) {
        this.lightingMaterials.forEach(material => {
            material.selected = val;
        });
    }

    async getCustomMaterials() {
        this.lightingMaterials = await firstValueFrom(this.lightingFixtureServiceDbService.getAllCustomMaterials());
        this.emitNumMaterials.emit(this.lightingMaterials.length);
    }

    ngOnDestroy() {
        this.selectAllSub.unsubscribe();
        this.selectedSub.unsubscribe();
    }
}