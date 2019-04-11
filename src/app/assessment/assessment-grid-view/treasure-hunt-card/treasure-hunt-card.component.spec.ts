import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureHuntCardComponent } from './treasure-hunt-card.component';

describe('TreasureHuntCardComponent', () => {
  let component: TreasureHuntCardComponent;
  let fixture: ComponentFixture<TreasureHuntCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureHuntCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureHuntCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
