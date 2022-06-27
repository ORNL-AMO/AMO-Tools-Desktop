import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CoolingTowerBasinFormComponent } from './cooling-tower-basin-form.component';

describe('CoolingTowerBasinFormComponent', () => {
  let component: CoolingTowerBasinFormComponent;
  let fixture: ComponentFixture<CoolingTowerBasinFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CoolingTowerBasinFormComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CoolingTowerBasinFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
