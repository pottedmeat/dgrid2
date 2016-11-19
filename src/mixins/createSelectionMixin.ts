import { ComposeMixinDescriptor } from 'dojo-compose/compose';
import delegate from 'dojo-dom/delegate';
import { h, VNode } from 'maquette';
import Dgrid from '../Dgrid';

export interface Selection {
	_lastSelected: HTMLElement;
	_selectionHandlerName: string;
	_selectionMode: string;
	_selectionTriggerEvent: UIEvent;
	_waitForMouseUp: HTMLElement;
	allSelected: boolean;
	selection: {
		[key: string]: boolean;
	};
	selectionMode: string;
}

export type SelectionGrid = Selection & Dgrid;

// TODO: complete implementation
const ctrlEquiv = 'ctrlKey';
const downType = 'mousedown';
const upType = 'mouseup';

function createSelectionMixin<T, O, U, P>(): ComposeMixinDescriptor<any, any, any, any> {
	return {
		mixin: {
			allowSelect() {
				return true;
			},

			/**
			 * Deselects any currently-selected items.
			 *
			 * @param [exceptId] If specified, the given id will not be deselected.
			 * @param [dontResetLastSelected] If true, `this._lastSelected` will not be cleared
			 */
			clearSelection(exceptId?: string, dontResetLastSelected?: boolean) {
				this.allSelected = false;

				for (let id in this.selection) {
					if (exceptId !== id) {
						this._select(id, null, false);
					}
				}

				if (!dontResetLastSelected) {
					this._lastSelected = null;
				}

				this._fireSelectionEvents();
			},

			/**
			 * Returns true if the indicated row is selected.
			 */
			isSelected(row: HTMLElement): boolean {
				if (row == null) {
					return false;
				}

				let isSelected = false;

				if (!(<any> row).dgridData) {
					row = this.row(row);
				}

				let rowId = (<any> row).dgridData[this.idProperty];

				// First check whether the given row is indicated in the selection hash;
				// failing that, check if allSelected is true (testing against the
				// allowSelect method if possible)
				if (rowId in this.selection) {
					isSelected = !!this.selection[rowId];
				}
				else if (this.allSelected) {
					isSelected = this.allowSelect(row);
				}

				return isSelected;
			},

			/**
			 * Selects or deselects the given row or range of rows.
			 *
			 * @param startingRow Row object (or something that can resolve to one) to (de)select
			 * @param [endingRow] If specified, the inclusive range between `startingRow` and `endingRow` will
			 * 		be (de)selected
			 * @param [isSelected] Whether to select (true/default), deselect (false), or toggle (null) the row
			 */
			select(startingRow: HTMLElement, endingRow?: HTMLElement, isSelected?: boolean) {
				this._select(startingRow, endingRow, isSelected);
				this._fireSelectionEvents();
			},

			/**
			 * Deselects the given row or range of rows.
			 *
			 * @param startingRow Row object (or something that can resolve to one) to deselect
			 * @param [endingRow] If specified, the inclusive range between `startingRow` and `endingRow` will
			 * 		be deselected
			 */
			deselect: function (startingRow: HTMLElement, endingRow?: HTMLElement) {
				this.select(startingRow, endingRow, false);
			},

			get selectionMode(): string {
				return this._selectionMode;
			},

			set selectionMode(mode: string) {
				if (mode === this._selectionMode) {
					return;
				}

				this.clearSelection();
				this._selectionMode = mode;
				this._selectionHandlerName = '_' + mode + 'SelectionHandler';

				// Also re-run allowTextSelection setter in case it is in automatic mode.
				// TODO: this._setAllowTextSelection(this.allowTextSelection);
			},

			_fireSelectionEvents() {

			},

			_handleSelect(event: UIEvent, target: HTMLElement) {
				const row = this.row(target);

				// Don't run if selection mode doesn't have a handler (incl. "none"), target can't be selected,
				// or if coming from a dgrid-cellfocusin from a mousedown
				if (!this[this._selectionHandlerName] || !this.allowSelect(row) ||
						(event.type === 'dgrid-cellfocusin' && (<any> event).parentType === 'mousedown') ||
						(event.type === upType && target !== this._waitForMouseUp)) {
					return;
				}
				this._waitForMouseUp = null;
				this._selectionTriggerEvent = event;

				// Don't call select handler for ctrl+navigation
				if (!(<KeyboardEvent> event).keyCode || !(<KeyboardEvent> event).ctrlKey || (<KeyboardEvent> event).keyCode === 32) {
					// If clicking a selected item, wait for mouseup so that drag n' drop
					// is possible without losing our selection
					if (!(<KeyboardEvent> event).shiftKey && event.type === downType && this.isSelected(row)) {
						this._waitForMouseUp = target;
					}
					else {
						this[this._selectionHandlerName](event, row);
					}
				}

				this._selectionTriggerEvent = null;
			},

			_select(startingRow: HTMLElement, endingRow?: HTMLElement, isSelected: boolean = true) {
				const rowId = (<any> startingRow).dgridData[this.idProperty];

				if (isSelected === false || this.allowSelect(startingRow)) {
					const previousValue = !!this.selection[rowId];

					if (isSelected === null) {
						isSelected = !previousValue;
					}

					if (!isSelected && !this.allSelected) {
						delete this.selection[rowId];
					}
					else {
						this.selection[rowId] = isSelected;
					}

					if (isSelected) {
						startingRow.classList.add('dgrid-selected');
					}
					else {
						startingRow.classList.remove('dgrid-selected');
					}
				}
			},

			/**
			 * Selection handler for "single" mode, where only one target may be selected at a time.
			 */
			_singleSelectionHandler(event: UIEvent, target: HTMLElement) {
				const ctrlKey = (<KeyboardEvent> event).keyCode ? (<KeyboardEvent> event).ctrlKey : (<any> event)[ctrlEquiv];

				if (this._lastSelected === target) {
					// Allow ctrl to toggle selection, even within single select mode.
					this.select(target, null, !ctrlKey || !this.isSelected(target));
				}
				else {
					this.clearSelection();
					this.select(target);
					this._lastSelected = target;
				}
			}
		},

		initialize(grid: SelectionGrid, options: any) {
			grid.selection = {};
			grid.selectionMode = options.selectionMode || 'none';
		},

		aspectAdvice: {
			after: {
				startup() {
					delegate(this.domNode, '.dgrid-row', 'click', (event: UIEvent) => {
						this._handleSelect(event, event.target);
					});
				}
			}
		}
	};
};

export default createSelectionMixin;
