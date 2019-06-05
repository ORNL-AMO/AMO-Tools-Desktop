import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TreasureChestComponent } from './treasure-chest.component';

describe('TreasureChestComponent', () => {
  let component: TreasureChestComponent;
  let fixture: ComponentFixture<TreasureChestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TreasureChestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TreasureChestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
