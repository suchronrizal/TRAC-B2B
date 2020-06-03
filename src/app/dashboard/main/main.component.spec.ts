import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MainDashboard } from './main.component';

describe('MainDashboard', () => {
  let component: MainDashboard;
  let fixture: ComponentFixture<MainDashboard>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MainDashboard ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MainDashboard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
