import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { GasMaterialSummaryComponent } from './gas-material-summary.component';

describe('GasMaterialSummaryComponent', () => {
  let component: GasMaterialSummaryComponent;
  let fixture: ComponentFixture<GasMaterialSummaryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ GasMaterialSummaryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(GasMaterialSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
