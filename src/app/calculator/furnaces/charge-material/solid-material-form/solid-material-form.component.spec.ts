import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolidMaterialFormComponent } from './solid-material-form.component';

describe('SolidMaterialFormComponent', () => {
  let component: SolidMaterialFormComponent;
  let fixture: ComponentFixture<SolidMaterialFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SolidMaterialFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SolidMaterialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
