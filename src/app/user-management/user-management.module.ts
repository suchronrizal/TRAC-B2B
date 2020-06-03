import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { KeyFilterModule } from 'primeng/keyfilter';

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
	PaginatorModule,
	TooltipModule
} from 'primeng/primeng';
import { CustomFormsModule } from 'ng2-validation';

// Component
import { RolePermissionComponent } from './role-permission/role-permission.component';
import { UserAccountComponent } from './user-account/user-account.component';

// Service
import { UserManagemenetService } from './user-managemenet.service';

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
		PaginatorModule,
		TooltipModule,
		KeyFilterModule,

		// Custom Module
		CustomFormsModule
	],
	providers: [UserManagemenetService],
	declarations: [RolePermissionComponent, UserAccountComponent]
})
export class UserManagementModule {}
