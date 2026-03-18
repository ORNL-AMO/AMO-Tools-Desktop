

import { Component, OnInit, EventEmitter, Input, Output } from '@angular/core';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-lighting-fixtures-material',
  templateUrl: './lighting-fixtures-material.component.html',
  styleUrls: ['./lighting-fixtures-material.component.css'],
  standalone: false
})
export class LightingFixturesMaterialComponent implements OnInit {

    @Output('closeModal')
    closeModal = new EventEmitter<number>();
    @Output('hideModal')
    hideModal = new EventEmitter();

    @Input() settings: Settings;
    @Input() editExistingMaterial: boolean;
    @Input() deletingMaterial: boolean;
    @Input() existingMaterial: any; // LightingFixtureData


    @Input() lightingCategories: any[] = [];
    selectedCategory: any = null;
    selectedFixture: any = null;

    newMaterial: any = {
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

    ngOnInit() {
        // Use the input lightingCategories for dropdowns and logic
        this.selectedCategory = this.lightingCategories && this.lightingCategories.length > 0 ? this.lightingCategories[0] : null;
        this.selectedFixture = this.selectedCategory && this.selectedCategory.fixturesData.length > 0 ? this.selectedCategory.fixturesData[0] : null;

        // Initialize newMaterial for edit or create
        if (this.editExistingMaterial && this.existingMaterial) {
            this.newMaterial = {
                category: this.existingMaterial.category ?? '',
                type: this.existingMaterial.type ?? '',
                lampsPerFixture: this.existingMaterial.lampsPerFixture ?? 0,
                wattsPerLamp: this.existingMaterial.wattsPerLamp ?? 0,
                lumensPerLamp: this.existingMaterial.lumensPerLamp ?? 0,
                lampLife: this.existingMaterial.lampLife ?? 0,
                coefficientOfUtilization: this.existingMaterial.coefficientOfUtilization ?? 0,
                ballastFactor: this.existingMaterial.ballastFactor ?? 0,
                lumenDegradationFactor: this.existingMaterial.lumenDegradationFactor ?? 0
            };
        } else {
            this.newMaterial = {
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
        }
    }

    onCategoryChange(category: any) {
        this.selectedCategory = category;
        this.selectedFixture = this.selectedCategory && this.selectedCategory.fixturesData.length > 0 ? this.selectedCategory.fixturesData[0] : null;
    }

    createNewFixture() {
        // Logic to open a modal or form for creating a new fixture
        // Placeholder: emit closeModal for now
        this.closeModal.emit();
    }

    editFixture() {
        // Logic to open a modal or form for editing the selected fixture
        // Placeholder: emit closeModal for now
        this.closeModal.emit();
    }

    deleteFixture() {
        // Logic to delete the selected fixture
        // Placeholder: emit closeModal for now
        this.closeModal.emit();
    }

    hideMaterialModal() {
        this.hideModal.emit();
    }
}