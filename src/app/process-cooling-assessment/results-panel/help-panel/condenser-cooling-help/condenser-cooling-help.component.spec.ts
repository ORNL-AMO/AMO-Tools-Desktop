import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CondenserCoolingHelpComponent } from './condenser-cooling-help.component';

describe('CondenserCoolingHelpComponent', () => {
  let component: CondenserCoolingHelpComponent;
  let fixture: ComponentFixture<CondenserCoolingHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CondenserCoolingHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CondenserCoolingHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
