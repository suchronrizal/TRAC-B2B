import { Component, OnInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment';
import * as Papa from 'papaparse/papaparse.min.js';
import { Router } from '@angular/router';
// import { Angular2Csv } from 'angular2-csv/Angular2-csv';
import { Angular5Csv } from 'angular5-csv/dist/Angular5-csv';
import { MainService } from '../../lib/service/main.service';

import { ProductPriceService } from '../product-price.service';

@Component({
	selector: 'app-product',
	templateUrl: './product.component.html',
	styleUrls: ['./product.component.scss']
})
export class ProductComponent implements OnInit {
	// ============================================================================== //
	// Properties
	// ============================================================================== //
	public data = [];
	public cols: any[];
	public loading: boolean;
	private selectedValues: string[];
	private selectedData: String[];
	private displayConfirm: boolean = false;
	private paginateTable: boolean = true;

	@ViewChild('filterSearch') filterSearch;

	constructor(
		private productPriceService: ProductPriceService,
		private mainService: MainService,
		private router: Router
	){}

	ngOnInit() {

		this.cols = [
			{
				field: 'MaterialSAPCode', 
				header: 'SAP Code Material',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'VehicleType', 
				header: 'Vehicle Type',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'RentalDuration', 
				header: 'Rental Duration',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'Fuel', 
				header: 'Fuel',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'TollandParking', 
				header: 'Tolland Parking',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'DriverorRider', 
				header: 'Driver',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
			{
				field: 'ChannelType', 
				header: 'Channel Type',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: false
			},
            {
				field: 'Branch', 
				header: 'Branch',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: true,
				disableCol: true
			},
			{
				field: 'CoverageArea', 
				header: 'Coverage Area',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'Crew', 
				header: 'Crew',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: false,
				disableCol: false
			},
			{
				field: 'MaterialId', 
				header: 'Material',
				filter: true, 
                filterMatchMode: 'contains', 
				ref: this.filterSearch,
				checked: false,
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

		this.fetchCustomer();
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
	// Fetch Procust
	// ============================================================================== //
	fetchProduct(){
		this.loading = true;
		let dataUser = JSON.parse(this.mainService['dataUser']);
		if(dataUser != null){
			this.productPriceService.getProduct(this.selectedCustomer,dataUser.UserCompanyMapping[0].BusinessUnitId).subscribe(res =>{
				this.data = res.Data[0].Products;
				this.loading = false;
				_.map(this.data, (x)=>{
					x.RentalDuration = x.RentalDuration + ' ' + x.UOM;
				})
			}, err =>{
				if(err.status == 401){
					this.mainService.updateToken(() =>{
						this.fetchProduct();
					});
				}
			});
		}
	}
	filterProduct(customer,minDate,maxDate){
		let dataUser = JSON.parse(this.mainService['dataUser']);
		let setMinDate = moment(minDate).format("YYYY-MM-DD");
		let setMaxDate = moment(maxDate).format("YYYY-MM-DD");
		this.loading = true;
		if(dataUser != null){
			this.productPriceService.getProductByFilter(customer,dataUser.UserCompanyMapping[0].BusinessUnitId,setMinDate,setMaxDate).subscribe(res =>{
				if(res.Data != ""){
					this.data = res.Data[0].Products;
				}
				this.loading = false;
			}, err =>{
				if(err.status == 401){
					this.mainService.updateToken(() =>{
						this.filterProduct(customer,minDate,maxDate);
					});
				}
			});
		}
	}

	// Calendar
    // ============================= //
    public minDateValue: Date = moment()['_d'];;    
    private minMinDate = moment()['_d'];
    public maxDateValue: Date = moment()['_d'];;    
    private minMaxDate = moment()['_d'];
    public disableMaxDate = true;
    selectMinDate(e){
        this.disableMaxDate = false;
	}  
	
	// ============================================================================== //
	// Fetch Customer
	// ============================================================================== //
    public customers = [];
    public selectedCustomer;
	fetchCustomer(){
		this.productPriceService.getCustomer().subscribe(res =>{
			this.customers = [];
			if(res.Data != ""){
				_.map(res.Data, (x)=>{
					let obj = {
						value: x.CustomerId,
						label: x.CustomerName
					};
					this.customers.push(obj);
				});
				this.selectedCustomer = this.customers[0].value;
			}
			this.fetchProduct();
		}, err =>{
			if(err.status == 401){
				this.mainService.updateToken(() =>{
					this.fetchCustomer();
				});
			}
		});
	}

	// Export All Data
	// =========================== //
	exportData(){
		this.loading = true;

		let dataUser = JSON.parse(this.mainService['dataUser']);
		this.productPriceService.getProduct(this.selectedCustomer,dataUser.UserCompanyMapping[0].BusinessUnitId).subscribe(res =>{
			var options = { 
				headers: Object.keys(res.Data[0]),
				fieldSeparator: ',',
				quoteStrings: '"',
				decimalseparator: '.',
				showLabels: true, 
				showTitle: true,
				useBom: true
			};
			// new Angular2Csv(res.Data[0].Products, 'Report Product', options);
			new Angular5Csv(res.Data[0].Products, 'Report Product', options);
			this.loading = false;
		});
	}
}
