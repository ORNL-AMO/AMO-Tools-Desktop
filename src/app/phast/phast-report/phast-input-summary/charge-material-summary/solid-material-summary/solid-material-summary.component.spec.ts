import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SolidMaterialSummaryComponent } from './solid-material-summary.component';

describe('SolidMaterialSummaryComponent', () => {
  let component: SolidMaterialSummaryComponent;
  let fixture: ComponentFixture<SolidMaterialSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SolidMaterialSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SolidMaterialSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
