import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PumpBasicsComponent } from './pump-basics.component';

describe('PumpBasicsComponent', () => {
  let component: PumpBasicsComponent;
  let fixture: ComponentFixture<PumpBasicsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PumpBasicsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PumpBasicsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
