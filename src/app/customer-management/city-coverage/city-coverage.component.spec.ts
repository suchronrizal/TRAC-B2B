import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CityCoverageComponent } from './city-coverage.component';

describe('CityCoverageComponent', () => {
  let component: CityCoverageComponent;
  let fixture: ComponentFixture<CityCoverageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CityCoverageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CityCoverageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should be created', () => {
    expect(component).toBeTruthy();
  });
});
