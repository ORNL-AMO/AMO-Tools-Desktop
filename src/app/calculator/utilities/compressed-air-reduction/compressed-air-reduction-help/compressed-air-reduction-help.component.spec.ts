import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirReductionHelpComponent } from './compressed-air-reduction-help.component';

describe('CompressedAirReductionHelpComponent', () => {
  let component: CompressedAirReductionHelpComponent;
  let fixture: ComponentFixture<CompressedAirReductionHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompressedAirReductionHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirReductionHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
