import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as Papa from 'papaparse/papaparse.min.js';
import { Router } from '@angular/router';

import { MainService } from '../../lib/service/main.service';
import { SelectItem } from 'primeng/components/common/selectitem';
import { MasterService } from '../master.service';

import { Message } from 'primeng/components/common/api';
import { MessageService } from 'primeng/components/common/messageservice';

@Component({
	selector: 'app-master-city',
	templateUrl: './master-city.component.html',
	styleUrls: ['./master-city.component.scss'],
	providers: [MessageService]
})
export class MasterCityComponent implements OnInit {
	// ============================================================================== //
	// Properties
	// ============================================================================== //
	public data = [];
	public cols: any[];
	public loading: boolean;
	private selectedValues: string[];
	private displayConfirm: boolean = false;
	private paginateTable: boolean = true;

	// Notification
	// =========================== //
	public msgs: Message[] = [];

	@ViewChild('filterSearch') filterSearch;

	constructor(
		private mainService: MainService,
		private router: Router,
		private masterService: MasterService,
	) { }

	ngOnInit(){
		this.cols = [
			{
				field: 'MsCityName', 
				header: 'City Name',
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
				field: 'MsCityId', 
				header: 'Master City Id',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'ProvinceName', 
				header: 'Province',
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
		this.fetchCity();
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
	// Fetch City
	// ============================================================================== //
	fetchCity(){
		let dataUser = JSON.parse(this.mainService['dataUser']);
		if(dataUser != null){
			this.loading = true;		
			this.masterService.getCity(dataUser.UserCompanyMapping[0].BusinessUnitId).subscribe(res =>{
				this.data = res.Data;
				this.loading = false;
				this.fetchProvince();
				this.fetchBranch();
			}, err =>{
				if(err.name == "TimeoutError"){
					this.fetchCity();
				}
				
				if(err.status == 401){
					this.mainService.updateToken(() =>{
						this.fetchCity();
					});
				}
			});
		}
	}

	// ============================================================================== //
    // Province
	// ============================================================================== //
	private dataLocation = [];
	public provinces = [];
	public selectedProvinceId = null;
	fetchProvince(){
		this.masterService.getProvince().subscribe(res =>{
			this.provinces = [];
			_.map(this.data, (x)=>{

				let find = _.find(res.Data, {MsProvinceId: x.ProvinceId});
				if(find != undefined){
					x.ProvinceName = find.MsProvinceName;
				}
			});

			_.map(res.Data, (x)=>{
				let obj = {value: x.MsProvinceId, label: x.MsProvinceName};
				this.provinces.push(obj);
			});
			this.selectedProvinceId = this.provinces[0].value;
		}, err =>{
			if(err.name == "TimeoutError"){
				this.fetchProvince();
			}

			if(err.status == 401){
				this.mainService.updateToken(() =>{
					this.fetchProvince();
				});
			}
		});
	}

	// ============================================================================== //
    // Branch
	// ============================================================================== //
	public branchs = [];
	public selectedBranch = null;
	fetchBranch(){
		let dataUser = JSON.parse(this.mainService['dataUser']);
		if(dataUser != null){
			this.masterService.getBranch(dataUser.UserCompanyMapping[0].BusinessUnitId).subscribe(res =>{
				this.branchs = [];
				_.map(res.Data, (x)=>{
					let obj = {value: x.BranchId, label: x.BranchName};
					this.branchs.push(obj);
				});
				this.selectedBranch = this.branchs[0].value;
	
				_.map(this.data, (x)=>{
					let find = _.find(res.Data, {BranchId: x.BranchId});
					if(find != undefined){
						x.BranchName = find.BranchName;
					}
				});
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

	public displayUpdateCity: boolean = false;
	public MsCityName = null;
	private selectedCity = null;
	public onSubmitBtn: boolean = false;
	updateCity(e){
		this.onSubmitBtn = true;
		this.masterService.putCity(e, this.selectedCity.MsCityId).subscribe(res =>{
			this.onSubmitBtn = false;
			this.fetchCity();
			this.closeUpdateCity();
			this.msgs = [];
			this.msgs.push({severity:'success', summary: 'Success', detail: 'Update city'});
		}, err =>{
			this.onSubmitBtn = false;
			this.msgs = [];
			this.msgs.push({severity:'error', summary: 'Failed', detail: 'Update city'});
		});
	}
	selectUpdate(e){
		this.selectedCity = e;
		this.MsCityName = e.MsCityName;
		this.selectedProvinceId = e.ProvinceId;
		this.selectedBranch = e.BranchId;
		this.displayUpdateCity = true;
	}
	closeUpdateCity(){
		this.selectedCity = null;
		this.displayUpdateCity = false;
	}
}
