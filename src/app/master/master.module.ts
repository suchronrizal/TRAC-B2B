import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule }   from '@angular/forms';
import { RouterModule } from '@angular/router';

// PrimeNG
import {
	DataTableModule,
	SharedModule,
	OverlayPanelModule,
	CheckboxModule,
	TabViewModule,
	OrganizationChartModule,
	AutoCompleteModule,
	SelectButtonModule,
	SpinnerModule,
	ProgressBarModule,
	CalendarModule,
	ProgressSpinnerModule,
	DialogModule,
	DropdownModule,
	InputMaskModule,
	FileUploadModule,
	InputSwitchModule,
	RadioButtonModule,
	GrowlModule,
	TooltipModule
} from 'primeng/primeng';
import { CustomFormsModule } from 'ng2-validation';

// Component
// ==================== //
import { MasterCityComponent } from './master-city/master-city.component';
import { MasterMenuComponent } from './master-menu/master-menu.component';
import { MasterBranchComponent } from './master-branch/master-branch.component';
import { MainMasterComponent } from './main-master/main-master.component';
import { MasterDateComponent } from './master-date/master-date.component';

// Service 
// ======================== //
import { MasterService } from './master.service';

@NgModule({
	imports: [
		HttpModule,
		CommonModule,
		FormsModule,
		RouterModule,

		// PrimeNG
		DataTableModule,
		InputSwitchModule,
		SharedModule,
		OverlayPanelModule,
		CheckboxModule,
		TabViewModule,
		OrganizationChartModule,
		AutoCompleteModule,
		SelectButtonModule,
		SpinnerModule,
		ProgressBarModule,
		CalendarModule,
		ProgressSpinnerModule,
		DialogModule,
		DropdownModule,
		InputMaskModule,
		FileUploadModule,
		RadioButtonModule,
		GrowlModule,
		TooltipModule,

		// Custom Module
		CustomFormsModule
	],
	declarations: [
		MasterCityComponent, 
		MasterMenuComponent, 
		MasterBranchComponent, 
		MainMasterComponent, 
		MasterDateComponent
	],
	providers: [MasterService]
})
export class MasterModule { }
