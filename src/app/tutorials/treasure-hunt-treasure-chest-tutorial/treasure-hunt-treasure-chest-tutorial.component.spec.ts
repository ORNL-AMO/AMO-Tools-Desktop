import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureHuntTreasureChestTutorialComponent } from './treasure-hunt-treasure-chest-tutorial.component';

describe('TreasureHuntTreasureChestTutorialComponent', () => {
  let component: TreasureHuntTreasureChestTutorialComponent;
  let fixture: ComponentFixture<TreasureHuntTreasureChestTutorialComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureHuntTreasureChestTutorialComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureHuntTreasureChestTutorialComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
