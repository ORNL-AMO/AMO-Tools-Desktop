import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BlowdownFlashTankConnectorComponent } from './blowdown-flash-tank-connector.component';

describe('BlowdownFlashTankConnectorComponent', () => {
  let component: BlowdownFlashTankConnectorComponent;
  let fixture: ComponentFixture<BlowdownFlashTankConnectorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BlowdownFlashTankConnectorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BlowdownFlashTankConnectorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
