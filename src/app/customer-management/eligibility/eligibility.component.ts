import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import * as _ from 'lodash';
import { SelectItem } from 'primeng/primeng';
import { Message } from 'primeng/components/common/api';
import { store } from '../../lib/service/reducer.service';
import { CustomerManagementService } from '../customer-management.service';
import { DetailCustomerComponent } from '../detail-customer/detail-customer.component';
import { MainService } from '../../lib/service/main.service';

@Component({
	selector: 'app-eligibility',
	templateUrl: './eligibility.component.html',
	styleUrls: ['./eligibility.component.scss']
})
export class EligibilityComponent implements OnInit {
	// ============================================================================== //
	// Properties
	// ============================================================================== //
	public data = [];
	public msgs: Message[] = [];
	public selectedValues: String[] = [];
	public submitButton: boolean = false;
	public loading: boolean = true;
	public updated: boolean = false;
	private eligibilityId = null;

	@Input() disableNext: boolean;
	@Input() isOpen: boolean;
	@Output() onSave = new EventEmitter();

	constructor(
		private mainService: MainService,
		private detailCustomer: DetailCustomerComponent,
		private cmService: CustomerManagementService
	) {}

	ngOnInit() {}

	ngOnChanges() {
		if (this.isOpen) {
			this.fetchData();
			this.fetchCategory();
		}
	}

	// ============================================================================== //
	// Save Data
	// ============================================================================== //
	private arrEligibility = [];
	private objSchema = {};
	save(valueForm) {
		// Create Eligibility Schema
		this.arrEligibility = [];
		_.map(this.data, x => {
			let ranges;
			if (this.selectedEligibility == 'MEC0001') {
				ranges = x.range1 + ',' + x.range2;
			} else {
				ranges = x.gradeRole;
			}
			let obj = {
				ConfigurationEligibilityDetailId: x.configurationEligibilityDetailId,
				ConfigurationEligibilityId: x.configurationEligibilityId,
				VehicleType: x.Id,
				EligibilityType: ranges.toString(),
				PassengerLimit: x.limit,
				PassengerMax: x.total,
				VehicleTypeName: x.unitType,
				BusinessUnitId: x.BusinessUnitId,
				Is_All: x.selectAll
			};
			this.arrEligibility.push(obj);
		});

		this.objSchema['ConfigurationEligibilityId'] = this.selectedEligibility;
		this.objSchema['EligibilityCategoryId'] = this.selectedEligibility;
		this.objSchema['CustomerId'] = this.detailCustomer['CustomerId'];
		this.objSchema['EligibilityDetail'] = this.arrEligibility;

		this.disableNext = false;
		this.submitButton = true;

		// Filter New Eligibility
		let arrNewEligibilityDetail = [];
		_.map(this.objSchema['EligibilityDetail'], x => {
			if (x.ConfigurationEligibilityDetailId == '') {
				let objNewEligibilityDetail = {
					ConfigurationEligibilityId: this.selectedEligibility,
					VehicleType: x.VehicleType,
					VehicleTypeName: x.VehicleTypeName,
					BusinessUnitId: x.BusinessUnitId,
					EligibilityType: x.EligibilityType,
					PassengerLimit: x.PassengerLimit,
					Is_All: x.Is_All,
					PassengerMax: x.PassengerMax
				};
				arrNewEligibilityDetail.push(objNewEligibilityDetail);
			}
		});

		if (!this.updated) {
			// Post Eligibility
			this.cmService.postEligibility(this.objSchema).subscribe(
				res => {
					this.submitButton = false;
					this.detailCustomer.updateConfigStep('1');
					this.onSave.emit();
					this.msgs = [];
					this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Success' });
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.save(valueForm);
						});
					} else {
						this.submitButton = false;
						this.msgs = [];
						this.msgs.push({ severity: 'error', summary: err.statusText, detail: err.statusText });
					}
				}
			);
		} else {
			// Update Eligibility
			this.cmService.updateEligibility(this.objSchema, this.eligibilityId).subscribe(
				res => {
					this.submitButton = false;
					this.detailCustomer.updateConfigStep('1');

					this.msgs = [];

					if (arrNewEligibilityDetail.length) {
						_.map(arrNewEligibilityDetail, x => {
							this.cmService.postEligibilityDetail(x).subscribe(
								res => {
									this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Post new eligibility detial' });
								},
								err => {
									this.msgs.push({ severity: 'error', summary: 'Failed', detail: 'Post new eligibility detial' });
								}
							);
						});
					}
					this.msgs.push({ severity: 'success', summary: 'Success', detail: 'Update Success' });
				},
				err => {
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.save(valueForm);
						});
					} else {
						this.submitButton = false;
						this.msgs = [];
						this.msgs.push({ severity: 'error', summary: err.statusText, detail: err.statusText });
						setTimeout(() => {
							this.onSave.emit();
						}, 3000);
					}
				}
			);
		}
	}

	// ============================================================================== //
	// Fetch Data
	// ============================================================================== //

	// Fetch Main Eligibility
	// =========================== //
	fetchData() {
		this.cmService.getEligibility(this.detailCustomer['CustomerId']).subscribe(res => {
			this.data = [];
			_.map(
				res.Data,
				x => {
					let obj = {
						configurationEligibilityId: '',
						configurationEligibilityDetailId: '',
						Id: x.VehicleTypeId,
						unitType: x.Description,
						selectAll: false,
						gradeRole: '',
						range1: '',
						range2: '',
						total: 0,
						limit: 0,
						BusinessUnitId: x.BusinessUnitId
					};
					this.data.push(obj);
				},
				err => {
					if (err.name == 'TimeoutError') {
						this.fetchData();
					}
					if (err.status == 401) {
						this.mainService.updateToken(() => {
							this.fetchData();
						});
					} else {
						this.submitButton = false;
						this.msgs = [];
						this.msgs.push({ severity: 'error', summary: err.statusText, detail: err.statusText });
					}
				}
			);
			this.loading = false;
			this.fetchDetail();
		});
	}

	// Fetch Detail Eligibility
	// =========================== //
	fetchDetail() {
		this.cmService.getDetailELigibility(this.detailCustomer['CustomerId']).subscribe(
			res => {
				if (res.Data != '') {
					store.dispatch({
						type: 'SET_ELIGIBILITY_CONFIG_ID',
						value: res.Data.ConfigurationEligibilityId
					});
					this.eligibilityId = res.Data.ConfigurationEligibilityId;
					this.selectedEligibility = res.Data.EligibilityCategoryId;

					_.map(this.data, x => {
						let sync = _.find(res.Data.EligibilityDetail, { VehicleType: x.Id });
						if (sync != undefined) {
							x.selectAll = sync.Is_All == '1';
							x.limit = Number(sync.PassengerLimit);
							x.total = Number(sync.PassengerMax);
							x.configurationEligibilityDetailId = sync.ConfigurationEligibilityDetailId;
							x.configurationEligibilityId = sync.ConfigurationEligibilityId;
							x.gradeRole = sync.EligibilityType.split(',');
							this.updated = true;
						}
					});
				}
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchDetail();
					});
				} else {
					this.submitButton = false;
					this.msgs = [];
					this.msgs.push({ severity: 'error', summary: err.statusText, detail: err.statusText });
				}
			}
		);
	}

	// Fetch Eligibility Category
	// =========================== //
	private eligibities: SelectItem[] = [];
	public selectedEligibility;

	fetchCategory() {
		this.cmService.getEligibilityCategory().subscribe(
			res => {
				this.eligibities = [];
				_.map(res.Data, x => {
					let obj = { label: x.MsEligibilityCategoryName, value: x.MsEligibilityCategoryId };
					this.eligibities.push(obj);
				});
				this.selectedEligibility = 'MEC0002';
				this.selectedEligibility = this.eligibities[1].value;
			},
			err => {
				if (err.status == 401) {
					this.mainService.updateToken(() => {
						this.fetchCategory();
					});
				} else {
					this.submitButton = false;
					this.msgs = [];
					this.msgs.push({ severity: 'error', summary: err.statusText, detail: err.statusText });
				}
			}
		);
	}
	onSelectType(e) {}

	// ============================================================================== //
	// Select Item
	// ============================================================================== //
	selectItem(e, obj) {
		if (e) {
			obj.selectAll = true;
		} else {
			obj.selectAll = false;
		}
	}

	// ============================================================================== //
	// Change Grade
	// ============================================================================== //
	changeGrade(e, obj) {
		obj.gradeRole = e.target.value;
	}
	changeRenge1(e, obj) {
		obj.range1 = e.target.value;
	}
	changeRenge2(e, obj) {
		obj.range2 = e.target.value;
	}
}
