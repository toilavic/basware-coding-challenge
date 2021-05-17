var columnDefs = [
    { field: 'athlete', editable: true, cellRenderer: onClickEdit() },
    { field: 'date', editable: true, cellEditor: 'datePicker', maxWidth: 200, cellRenderer: onClickEdit() },
    { field: 'country', maxWidth: 150 },
    { field: 'year', maxWidth: 120 },
    { field: 'sport', editable: true, maxWidth: 250, cellRenderer: onClickEdit() },

];

var gridOptions = {
    columnDefs: columnDefs,
    defaultColDef: {
        flex: 1,
        minWidth: 280,
        // we use a cell renderer to include a button, so when the button
        // gets clicked, the editing starts.
        cellRenderer: 'singleClickEditRenderer'
    },
    // set the bottom grid to no click editing
    suppressClickEdit: true,
    components: {
        datePicker: getDatePicker()
    },
};

function onClickEdit() {
    function CellRenderer() { }
    CellRenderer.prototype.createGui = function () {
        var template =
            // should be a pencil icon 
            '<span><span id="theValue" style="padding-left: 4px;"></span><button style="float:right" id="theButton">Edit</button></span>';
        var tempDiv = document.createElement("div");
        tempDiv.innerHTML = template;
        this.eGui = tempDiv.firstElementChild;
    };
    CellRenderer.prototype.init = function (params) {
        this.createGui();
        this.params = params;
        var eValue = this.eGui.querySelector("#theValue");
        eValue.innerHTML = params.value;
        this.eButton = this.eGui.querySelector("#theButton");
        this.buttonClickListener = this.onButtonClicked.bind(this);
        this.eButton.addEventListener("click", this.buttonClickListener);
    };
    CellRenderer.prototype.onButtonClicked = function () {
        var startEditingParams = {
            rowIndex: this.params.rowIndex,
            colKey: this.params.column.getId()
        };
        this.params.api.startEditingCell(startEditingParams);
    };
    CellRenderer.prototype.getGui = function () {
        return this.eGui;
    };
    CellRenderer.prototype.destroy = function () {
        this.eButton.removeEventListener("click", this.buttonClickListener);
    };
    return CellRenderer;
}

function getDatePicker() {
    // function to act as a class
    function Datepicker() { }

    // gets called once before the renderer is used
    Datepicker.prototype.init = function (params) {
        // create the cell
        this.eInput = document.createElement('input');
        this.eInput.value = params.value;
        this.eInput.classList.add('ag-input');
        this.eInput.style.height = '100%';

        // https://jqueryui.com/datepicker/
        $(this.eInput).datepicker({
            dateFormat: 'dd/mm/yy',
        });
    };

    // gets called once when grid ready to insert the element
    Datepicker.prototype.getGui = function () {
        return this.eInput;
    };

    // focus and select can be done after the gui is attached
    Datepicker.prototype.afterGuiAttached = function () {
        this.eInput.focus();
        this.eInput.select();
    };

    // returns the new value after editing
    Datepicker.prototype.getValue = function () {
        return this.eInput.value;
    };

    // any cleanup we need to be done here
    Datepicker.prototype.destroy = function () {
        // but this example is simple, no cleanup, we could
        // even leave this method out as it's optional
    };

    // if true, then this editor will appear in a popup
    Datepicker.prototype.isPopup = function () {
        // and we could leave this method out also, false is the default
        return false;
    };

    return Datepicker;
}

// setup the grid after the page has finished loading
document.addEventListener('DOMContentLoaded', function () {
    var gridDiv = document.querySelector('#myGrid');
    new agGrid.Grid(gridDiv, gridOptions);

    agGrid
        .simpleHttpRequest({
            url: 'https://www.ag-grid.com/example-assets/olympic-winners.json',
        })
        .then(function (data) {
            gridOptions.api.setRowData(data);
        });
});
