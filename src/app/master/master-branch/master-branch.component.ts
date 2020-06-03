import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as Papa from 'papaparse/papaparse.min.js';
import { Router } from '@angular/router';

import { MainService } from '../../lib/service/main.service';
import { SelectItem } from 'primeng/components/common/selectitem';
import { MasterService } from '../master.service';

@Component({
    selector: 'app-master-branch',
    templateUrl: './master-branch.component.html',
    styleUrls: ['./master-branch.component.scss']
})
export class MasterBranchComponent implements OnInit {
	// ============================================================================== //
	// Properties
	// ============================================================================== //
	public data = [];
	public cols: any[];
	public loading: boolean;
	private selectedValues: string[];
	private displayConfirm: boolean = false;
	private paginateTable: boolean = true;

	@ViewChild('filterSearch') filterSearch;

	constructor(
		private mainService: MainService,
		private router: Router,
		private masterService: MasterService,
	) { }

	ngOnInit(){
		this.cols = [
			{
				field: 'BranchId', 
				header: 'BranchId',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'BranchName', 
				header: 'Branch Name',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'BusinessUnitId', 
				header: 'Business Unit Id',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			}
		];

		
		let filterChecked = [];
		_.map(this.cols, (x)=>{
			if(x.checked){
				filterChecked.push(x.field);
			}
		});
		this.selectedValues = filterChecked;

		this.fetchBranch();
	}

	// Toggle Checkbox Columns
	// =========================== //
	checkBox(e){
		if(e.checked){
            e.checked = false;
        } else {
            e.checked = true;
        }  
	}

	// ============================================================================== //
	// Fetch Branch
	// ============================================================================== //
	fetchBranch(){
		this.loading = true;	
		let dataUser = JSON.parse(this.mainService['dataUser']);
		if(dataUser != null){
			this.masterService.getBranch(dataUser.UserCompanyMapping[0].BusinessUnitId).subscribe(res =>{
				this.data = res.Data;
				this.loading = false;
			}, err =>{
				if(err.name == "TimeoutError"){
					this.fetchBranch();
				}
				
				if(err.status == 401){
					this.mainService.updateToken(() =>{
						this.fetchBranch();
					});
				}
			});
		}
	}

	// Export All Data
	// =========================== //
	downloadCSV(){
		this.mainService.exportDataCsv(this.data,'Report Master City');
	}
	downloadXLS(){
		this.mainService.exportDataXls(this.data,'Report Master City');
	}
}
