import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

// Component
import { LayoutComponent } from './component/layout.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { HeaderComponent } from './header/header.component';

// PrimeNG
import { 
	PanelMenuModule, 
	OverlayPanelModule,
	SidebarModule,
	TabViewModule,
	ProgressSpinnerModule,
	DialogModule,
	CalendarModule,
	SpinnerModule,
	ProgressBarModule,
	GrowlModule
} from 'primeng/primeng';


// Service
import { MainService } from '../lib/service/main.service';
import { LayoutService } from './layout.service';

@NgModule({
	imports: [
		CommonModule,
		HttpModule,
		RouterModule,
		FormsModule,

		// PrimeNG
		PanelMenuModule,
		OverlayPanelModule,
		SidebarModule,
		TabViewModule,
		ProgressSpinnerModule,
		DialogModule,
		CalendarModule,
		SpinnerModule,
		ProgressBarModule,
		GrowlModule
	],
	exports:[LayoutComponent],
	providers: [LayoutService, MainService],
	declarations: [
		LayoutComponent,
		HeaderComponent,
		SidebarComponent
	]
})
export class LayoutModule { }
