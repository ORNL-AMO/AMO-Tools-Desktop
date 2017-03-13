import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WallLossesFormComponent } from './wall-losses-form.component';

describe('WallLossesFormComponent', () => {
  let component: WallLossesFormComponent;
  let fixture: ComponentFixture<WallLossesFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WallLossesFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WallLossesFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
