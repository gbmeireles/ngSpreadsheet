import { HostBinding, Component, Input, ElementRef, ViewChildren, Renderer } from '@angular/core';
import { OnInit, OnDestroy, OnChanges } from '@angular/core';
import { CORE_DIRECTIVES, NgFor } from '@angular/common';
import { ColumnCellComponent } from './ColumnCell/ColumnCell';
import {
    Column,
    GridColumn,
    ColumnPositionInformationMap,
} from '../Model/Model';

const columnUnitList: string[] =
    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

const css = `
:host {
    display: block;
    position: relative;
    height: 20px;
}`;

const html = `
<GgColumnCell *ngFor="let gridColumn of visibleGridColumnList; let columnIndex = index; trackBy:cellIndentity;" 
    [gridColumn]="gridColumn"
    [columnList]="columnList"
    [index]="columnIndex" 
    [columnIdentifier]="gridColumnIdentifierMap[gridColumn.index]"
    [columnPositionInformationMap]="columnPositionInformationMap">
</GgColumnCell>`;

@Component({
    directives: [ColumnCellComponent, NgFor],
    selector: 'GgColumnRow',
    template: html,
    styles: [css],
})
export class ColumnRowComponent implements OnInit, OnDestroy, OnChanges {
    @Input('gridSectionName') gridSectionName: string;
    @HostBinding('style.height') height: number;
    @Input('visibleGridColumnList') visibleGridColumnList: GridColumn[];
    @Input('gridColumnList') gridColumnList: GridColumn[];
    @Input('columnList') columnList: Column[];
    @Input('columnPositionInformationMap') columnPositionInformationMap: ColumnPositionInformationMap;

    @Input('scrollWidth')
    @HostBinding('style.minWidth')
    scrollWidth: number;

    gridColumnIdentifierMap: { [columnIndex: number]: string } = {};

    constructor(private el: ElementRef,
        private renderer: Renderer) {
    }

    cellIndentity(index: number, cell): any {
        return index;
    }

    updateColumnIdentifierList() {
        this.gridColumnIdentifierMap = {};

        if (!this.gridColumnList) {
            return;
        }

        var tensCount = 0;
        var unitCount = 0;

        this.gridColumnList.forEach(gc => {
            unitCount = gc.index % columnUnitList.length;
            tensCount = Math.floor(gc.index / columnUnitList.length);
            var columnIdentifier = '';
            if (tensCount > 0) {
                columnIdentifier = columnUnitList[tensCount];
            }
            columnIdentifier = columnIdentifier + columnUnitList[unitCount];
            this.gridColumnIdentifierMap[gc.index] = columnIdentifier;
        });
    }

    ngOnInit() {
        this.updateColumnIdentifierList();
    }

    ngOnChanges(obj) {
        if (obj['gridColumnList'] || obj['visibleGridColumnList']) {
            this.updateColumnIdentifierList();
        }
    }

    ngOnDestroy() {
    }
}