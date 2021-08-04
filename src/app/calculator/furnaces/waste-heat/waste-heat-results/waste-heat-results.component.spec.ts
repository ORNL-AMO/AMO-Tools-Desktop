import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WasteHeatResultsComponent } from './waste-heat-results.component';

describe('WasteHeatResultsComponent', () => {
  let component: WasteHeatResultsComponent;
  let fixture: ComponentFixture<WasteHeatResultsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WasteHeatResultsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WasteHeatResultsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
