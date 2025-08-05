import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TowerHelpComponent } from './tower-help.component';

describe('TowerHelpComponent', () => {
  let component: TowerHelpComponent;
  let fixture: ComponentFixture<TowerHelpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TowerHelpComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TowerHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
