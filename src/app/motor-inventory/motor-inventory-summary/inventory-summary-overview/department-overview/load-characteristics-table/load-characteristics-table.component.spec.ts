import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadCharacteristicsTableComponent } from './load-characteristics-table.component';

describe('LoadCharacteristicsTableComponent', () => {
  let component: LoadCharacteristicsTableComponent;
  let fixture: ComponentFixture<LoadCharacteristicsTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadCharacteristicsTableComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadCharacteristicsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
