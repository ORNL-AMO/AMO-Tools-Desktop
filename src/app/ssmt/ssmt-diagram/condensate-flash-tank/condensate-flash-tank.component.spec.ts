import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CondensateFlashTankComponent } from './condensate-flash-tank.component';

describe('CondensateFlashTankComponent', () => {
  let component: CondensateFlashTankComponent;
  let fixture: ComponentFixture<CondensateFlashTankComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CondensateFlashTankComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CondensateFlashTankComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
