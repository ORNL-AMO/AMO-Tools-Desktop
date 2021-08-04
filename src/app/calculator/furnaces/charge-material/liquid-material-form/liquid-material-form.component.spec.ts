import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LiquidMaterialFormComponent } from './liquid-material-form.component';

describe('LiquidMaterialFormComponent', () => {
  let component: LiquidMaterialFormComponent;
  let fixture: ComponentFixture<LiquidMaterialFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ LiquidMaterialFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LiquidMaterialFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
