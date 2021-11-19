import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CentrifugalSpecificsComponent } from './centrifugal-specifics.component';

describe('CentrifugalSpecificsComponent', () => {
  let component: CentrifugalSpecificsComponent;
  let fixture: ComponentFixture<CentrifugalSpecificsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CentrifugalSpecificsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CentrifugalSpecificsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
