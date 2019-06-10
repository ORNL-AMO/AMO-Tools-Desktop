import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureHuntComponent } from './treasure-hunt.component';

describe('TreasureHuntComponent', () => {
  let component: TreasureHuntComponent;
  let fixture: ComponentFixture<TreasureHuntComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureHuntComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureHuntComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
