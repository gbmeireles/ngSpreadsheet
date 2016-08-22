import { Injectable } from '@angular/core';
import { CellManager } from './CellManager';
import { Cell, CellLocation } from '../Model/Model';

@Injectable()
export class CellGetter {
    constructor(private cellManager: CellManager) {

    }

    get(cellLocation: CellLocation): Cell {
        var cellList = this.cellManager.getCellListBySpreadsheetColumnIndex(cellLocation.columnIndex);
        return cellList.find(cell => cell.spreadsheetCell && cell.spreadsheetCell.rowIndex === cellLocation.rowIndex);
    }
}