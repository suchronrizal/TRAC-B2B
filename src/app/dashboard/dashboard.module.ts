import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpModule } from '@angular/http';
import { FormsModule }   from '@angular/forms';
import { RouterModule } from '@angular/router';

import { MainDashboard } from './main/main.component';
import { ProgressBarModule, ChartModule } from 'primeng/primeng';

@NgModule({
    imports: [
        HttpModule,
		CommonModule,
		FormsModule,
        RouterModule,
        
        ProgressBarModule,
        ChartModule
    ],
    declarations: [
        MainDashboard
    ],
    exports: [MainDashboard]
})
export class DashboardModule { }
