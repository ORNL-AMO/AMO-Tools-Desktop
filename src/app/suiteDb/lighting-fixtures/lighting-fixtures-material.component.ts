import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { LightingSuiteApiService, LightingFixtureData } from '../../tools-suite-api/lighting-suite-api.service';
import { LightingFixtureServiceDbService } from '../../indexedDb/lighting-fixture-db.service';
import { firstValueFrom } from 'rxjs';
import { LightingFixtureMaterial } from '../../shared/models/materials';
import { SettingsDbService } from '../../indexedDb/settings-db.service';
import { LightingFixtureCategory } from '../../tools-suite-api/lighting-suite-api.service';
import * as _ from 'lodash';
@Component({
  selector: 'app-lighting-fixtures-material',
  templateUrl: './lighting-fixtures-material.component.html',
  styleUrls: ['./lighting-fixtures-material.component.css'],
  standalone: false
})
export class LightingFixturesMaterialComponent implements OnInit {

    @Output('closeModal')
    closeModal = new EventEmitter<LightingFixtureMaterial>();
    @Output('hideModal')
    hideModal = new EventEmitter();

    @Input() settings: Settings;
    @Input() editExistingMaterial: boolean;
    @Input() deletingMaterial: boolean;
    @Input() existingMaterial: LightingFixtureMaterial;

    selectedFixture: any = null;
    selectedMaterial: LightingFixtureMaterial;
    allLightingCategories: Array<LightingFixtureCategory>;
    allMaterials: Array<LightingFixtureMaterial>;
    allCustomMaterials: Array<LightingFixtureMaterial>;
    fixturesData: Array<LightingFixtureData>;
    isValidMaterialName: boolean = true;
    nameError: string = null;
    canAdd: boolean;
    idbEditMaterialId: number;
    hideTypes: boolean = false;
    currentField: string = 'selectedMaterial';
    newMaterial: LightingFixtureMaterial = {
        name: 'New Material',
        category: '',
        type: '',
        lampsPerFixture: 0,
        wattsPerLamp: 0,
        lumensPerLamp: 0,
        lampLife: 0,
        coefficientOfUtilization: 0,
        ballastFactor: 0,
        lumenDegradationFactor: 0
    };
    constructor(private settingsDbService: SettingsDbService, private lightingSuiteApiService: LightingSuiteApiService, private lightingFixtureServiceDbService: LightingFixtureServiceDbService) { }

    ngOnInit() {
        if (!this.settings) {
            this.settings = this.settingsDbService.getByDirectoryId(1);
        }
        if (this.editExistingMaterial) {
            this.setAllMaterials();
        } else {
            this.canAdd = true;
            this.setAllMaterials();
            this.checkMaterialName();
        }
    }

    async setAllMaterials() {
        this.allLightingCategories = this.lightingSuiteApiService.getLightingSystems();
        this.allMaterials = await firstValueFrom(this.lightingFixtureServiceDbService.getAllWithObservable());
        this.allCustomMaterials = await firstValueFrom(this.lightingFixtureServiceDbService.getAllCustomMaterials());
        this.idbEditMaterialId = this.allCustomMaterials.find(material => this.existingMaterial?.type === material.type)?.id;
        this.setExisting();
    }

    setExisting() {
        if (this.editExistingMaterial && this.existingMaterial) {
            this.newMaterial = {
                id: this.existingMaterial.id,
                name: this.existingMaterial.name ?? '',
                category: this.existingMaterial.category ?? '',
                type: this.existingMaterial.type ?? '',
                lampsPerFixture: this.existingMaterial.lampsPerFixture ?? 0,
                wattsPerLamp: this.existingMaterial.wattsPerLamp ?? 0,
                lumensPerLamp: this.existingMaterial.lumensPerLamp ?? 0,
                lampLife: this.existingMaterial.lampLife ?? 0,
                coefficientOfUtilization: this.existingMaterial.coefficientOfUtilization ?? 0,
                ballastFactor: this.existingMaterial.ballastFactor ?? 0,
                lumenDegradationFactor: this.existingMaterial.lumenDegradationFactor ?? 0,
                selected: this.existingMaterial.selected ?? false,
                isDefault: this.existingMaterial.isDefault ?? false
            };
        }
        else if (this.selectedMaterial) {
            const firstFixture = this.fixturesData && this.fixturesData.length > 0
                ? this.fixturesData[0]
                : null;

            this.newMaterial = {
                name: this.selectedMaterial.name ?? '',
                category: this.selectedMaterial.category ?? '',
                type: firstFixture?.type ?? '',
                lampsPerFixture: firstFixture?.lampsPerFixture ?? 0,
                wattsPerLamp: firstFixture?.wattsPerLamp ?? 0,
                lumensPerLamp: firstFixture?.lumensPerLamp ?? 0,
                lampLife: firstFixture?.lampLife ?? 0,
                coefficientOfUtilization: firstFixture?.coefficientOfUtilization ?? 0,
                ballastFactor: firstFixture?.ballastFactor ?? 0,
                lumenDegradationFactor: firstFixture?.lumenDegradationFactor ?? 0,
                selected: false,
                isDefault: false
            };

            this.checkMaterialName();
        }
    }

    checkMaterialName() {
        let test = _.filter(material => material.name.toLowerCase().trim() === this.newMaterial.name.toLowerCase().trim());
        if (test.length > 0) {
            this.nameError = 'Cannot have same name as existing material';
            this.isValidMaterialName = false;
        } else {
            this.isValidMaterialName = true;
            this.nameError = null;
        }
    }

    checkEditMaterialName() {
        let test = this.allMaterials.filter(material => {
            if (material.id !== this.idbEditMaterialId) {
                return material.name.toLowerCase().trim() === this.newMaterial.name.toLowerCase().trim();
            }
        });
        if (test.length > 0) {
            this.nameError = 'This name is in use by another material';
            this.isValidMaterialName = false;
        }
        else if (this.newMaterial.name.toLowerCase().trim() === '') {
            this.nameError = 'The material must have a name';
            this.isValidMaterialName = false;
        }
        else {
            this.isValidMaterialName = true;
            this.nameError = null;
        }
    }

    getFixtureByType(type: string) {
        return this.fixturesData?.find(f => f.type === type);
    }

    async addMaterial() {
        if (this.canAdd) {
            this.canAdd = false;
            await firstValueFrom(this.lightingFixtureServiceDbService.addWithObservable(this.newMaterial));
            let materials = await firstValueFrom(this.lightingFixtureServiceDbService.getAllWithObservable());
            this.lightingFixtureServiceDbService.dbLightingFixtureMaterials.next(materials);
            this.closeModal.emit(this.newMaterial);
        }
    }

    async updateMaterial() {
        this.newMaterial.id = this.idbEditMaterialId;
        await firstValueFrom(this.lightingFixtureServiceDbService.updateWithObservable(this.newMaterial));
        let materials = await firstValueFrom(this.lightingFixtureServiceDbService.getAllWithObservable());
        this.lightingFixtureServiceDbService.dbLightingFixtureMaterials.next(materials);
        this.closeModal.emit(this.newMaterial);
    }

    async deleteMaterial() {
        if (this.deletingMaterial && this.existingMaterial) {
            await firstValueFrom(this.lightingFixtureServiceDbService.deleteByIdWithObservable(this.idbEditMaterialId));
            let materials = await firstValueFrom(this.lightingFixtureServiceDbService.getAllWithObservable());
            this.lightingFixtureServiceDbService.dbLightingFixtureMaterials.next(materials);
            this.closeModal.emit(this.newMaterial);
        }
    }

    onCategoryChange(selected: any) {
        this.fixturesData = selected?.fixturesData || [];
        this.hideTypes = selected.category === 0;
        this.newMaterial.category = selected?.label || '';
        if (this.fixturesData.length > 0) {
            this.newMaterial.type = this.fixturesData[0].type;
            this.onFixtureTypeChange(this.fixturesData[0]);
        } else {
            this.newMaterial.type = '';
        }
    }

    onFixtureTypeChange(selectedFixture: any) {
        if (selectedFixture) {
            this.newMaterial.name = selectedFixture.type ?? '';
            this.newMaterial.lampsPerFixture = selectedFixture.lampsPerFixture ?? 0;
            this.newMaterial.wattsPerLamp = selectedFixture.wattsPerLamp ?? 0;
            this.newMaterial.lumensPerLamp = selectedFixture.lumensPerLamp ?? 0;
            this.newMaterial.lampLife = selectedFixture.lampLife ?? 0;
            this.newMaterial.coefficientOfUtilization = selectedFixture.coefficientOfUtilization ?? 0;
            this.newMaterial.ballastFactor = selectedFixture.ballastFactor ?? 0;
            this.newMaterial.lumenDegradationFactor = selectedFixture.lumenDegradationFactor ?? 0;
        }
    }

    hideMaterialModal() {
        this.hideModal.emit();
    }

    focusField(str: string) {
        this.currentField = str;
    }
}