import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChargeMaterialHelpComponent } from './charge-material-help.component';

describe('ChargeMaterialHelpComponent', () => {
  let component: ChargeMaterialHelpComponent;
  let fixture: ComponentFixture<ChargeMaterialHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChargeMaterialHelpComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ChargeMaterialHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
