import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ExploreChargeMaterialsFormComponent } from './explore-charge-materials-form.component';

describe('ExploreChargeMaterialsFormComponent', () => {
  let component: ExploreChargeMaterialsFormComponent;
  let fixture: ComponentFixture<ExploreChargeMaterialsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ExploreChargeMaterialsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ExploreChargeMaterialsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
