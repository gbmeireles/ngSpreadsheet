import { Component, OnInit, Input } from '@angular/core';
import { CellManager } from '../Services/Services';
import { CellLocation } from '../Model/Model';
const html = `
<div>
    <i class="icon-logo"></i>
    <span>{{activeCellData}}</span>
</div>`;

const css = `
:host {
    display: block;
    height: 36px;
    position: relative;
}

i {
    display: block;
    float: left;
    position: absolute;
    font-size: 14px;
    top: 8px;
    left: 5px;
}

div {
    display: block;
    width: 100%;
    overflow: hidden;
    height: 100%;
    background-color: #E6E6E6;
    padding-left: 20px;
    padding-right: 5px;
    float: left;
}

span {
    height: 24px;
    display: block;
    margin-top: 3px;
    padding-left: 5px;
    padding-top: 2px;
    font-size: 12px;
    width: 100%;
    float: left;
    background-color: #FAFAFA;
    border: 1px solid #C6C6C6;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}`;

@Component({
    selector: 'GgDetailsBar',
    template: html,
    styles: [css],
})
export class DetailsBarComponent implements OnInit {
    @Input('activeCellLocation') activeCellLocation: CellLocation;

    private activeCellData: string = 'Selecione uma célula';

    constructor(private cellManager: CellManager) { }

    ngOnInit() {
    }

    ngOnChanges() {
        var activeCell = this.cellManager.getCellListByGridColumnIndex(this.activeCellLocation.gridColumnIndex)
            .find(cell => cell.gridCell.rowIndex === this.activeCellLocation.rowIndex);
        if (!activeCell) {
            return;
        }
        var gridCell = activeCell.gridCell;
        if (gridCell.formatData == undefined) {
            this.activeCellData = gridCell.data;
        } else {
            this.activeCellData = gridCell.formatData(gridCell.data);
        }
    }

}