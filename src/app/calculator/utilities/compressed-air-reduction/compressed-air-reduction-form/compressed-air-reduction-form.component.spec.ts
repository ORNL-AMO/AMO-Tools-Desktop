import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompressedAirReductionFormComponent } from './compressed-air-reduction-form.component';

describe('CompressedAirReductionFormComponent', () => {
  let component: CompressedAirReductionFormComponent;
  let fixture: ComponentFixture<CompressedAirReductionFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompressedAirReductionFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompressedAirReductionFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
