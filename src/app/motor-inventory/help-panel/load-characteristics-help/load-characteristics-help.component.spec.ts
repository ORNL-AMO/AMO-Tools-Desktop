import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LoadCharacteristicsHelpComponent } from './load-characteristics-help.component';

describe('LoadCharacteristicsHelpComponent', () => {
  let component: LoadCharacteristicsHelpComponent;
  let fixture: ComponentFixture<LoadCharacteristicsHelpComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LoadCharacteristicsHelpComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LoadCharacteristicsHelpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
