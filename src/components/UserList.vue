<template>
  <div class="user-list">
    
    <ag-grid-vue
      style="width: 100%; height: auto;"
      class="ag-theme-material"
      :rowData="rowData"
      :columnDefs="columnDefs"
      :gridOptions="gridOptions"
      rowSelection="multiple"
      domLayout="autoHeight"
      :localeText="localeText"
      :floatingFilter="true"
      :defaultColDef="{
                            sortable: true,
                            resizable: true,
                            filter: true,
                            editable: false,
                            width: 120,
                         }"
      @column-resized="onColumnChange"
      @column-moved="onColumnChange"
      @column-visible="onColumnChange"
    >
    </ag-grid-vue>
    
    <v-bottom-sheet id="select_columns" v-model="sheet">
      <template v-slot:activator>
        <v-btn
          color="purple"
          dark
        >
        Columns
        </v-btn>
      </template>
      <v-list>
        <v-subheader>Choose Columns</v-subheader>
        <div id="change_visibility">
          <div
            v-for="(column, key, index) in this.columnDefs"
            :key="index"
          >
            <v-checkbox
              v-on:change="columnVisibility(key)"
              v-model="column.show"
              :label="formatColumnName(column.headerName)"
            ></v-checkbox>
          </div>
        </div>
      </v-list>
    </v-bottom-sheet>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { AgGridVue } from "ag-grid-vue";
import router from "../router";
import UserService from "../services/users";

@Component({
  name: "UserList",
  components: {
    AgGridVue
  }
})
export default class UserList extends Vue {
  rowData: {}[] = [{}];
  enabled: boolean = true;
  sheet:boolean = false;
  columnDefs: {
    field: string;
    headerName: string;
    hide: boolean;
    show: boolean;
    width: number;
    filter?: string;
    cellRenderer?: any;
  }[] = [];
  dialogm1: string = "";
  dialog: boolean = false;

  gridOptions: any = <any>{};
  localeText: {} = {
    // for filter panel
    page: "Página",
    more: "mais",
    to: "para",
    of: "de",
    next: "Próximo",
    last: "Último",
    first: "Primeiro",
    previous: "Anterior",
    loadingOoo: "Carregar",

    // for set filter
    selectAll: "Selecionar tudo",
    searchOoo: "Procurar",
    blanks: "Vazio",

    // for number filter and text filter
    filterOoo: "Filtrar",
    applyFilter: "Aplicar filtro",

    // for number filter
    equals: "Igual",
    lessThan: "Menor que",
    greaterThan: "Maior que",

    // for text filter
    contains: "Contém",
    notContains: "Não contém",
    notEqual: "Não é igual",
    startsWith: "Começa com",
    endsWith: "Termina com",

    // the header of the default group column
    group: "Grupo",

    // tool panel
    columns: "Colunas",
    rowGroupColumns: "Colunas do grupo de linhas",
    rowGroupColumnsEmptyMessage: "Colunas do grupo de linhas vazias",
    valueColumns: "Valores das colunas",
    pivotMode: "Modo pivô",
    groups: "Grupos",
    values: "Valores",
    pivots: "Pivôs",
    valueColumnsEmptyMessage: "Valores de colunas vazias",
    pivotColumnsEmptyMessage: "Pivôs de colunas vazias",
    toolPanelButton: "Botão de painel de ferramentas",

    // other
    noRowsToShow: "Não há registros para mostrar.",

    // enterprise menu
    pinColumn: "Pinar coluna",
    valueAggregation: "Agregar valor",
    autosizeThiscolumn: "Redimensionar esta coluna",
    autosizeAllColumns: "Redimensionar todas colunas",
    groupBy: "Agrupar por",
    ungroupBy: "Desagrupar por",
    resetColumns: "Resetar colunas",
    expandAll: "Expandir tudo",
    collapseAll: "Contrair tudo",
    toolPanel: "Painel de ferramentas",
    export: "Exportar",
    csvExport: "Exportar para CSV",
    excelExport: "Exportar para Excel",

    // enterprise menu pinning
    pinLeft: "Pinar <<",
    pinRight: "Pinar >>",
    noPin: "Sem pinagem",

    // enterprise menu aggregation and status panel
    sum: "Soma",
    min: "Mínimo",
    max: "Máximo",
    none: "Nenhum",
    count: "Contagem",
    average: "Média",

    // standard menu
    copy: "Copiar",
    copyWithHeaders: "Copiar com cabeçalho",
    ctrlC: "Ctrl+C",
    paste: "Colar",
    ctrlV: "Ctrl+V"
  };

  onColumnChange(event: {}) {
    var columns = this.gridOptions.columnApi.getAllGridColumns();
    console.log(columns);
    var customizedColumnDefsArray: any[] = [];
    columns.map((column: any) => {
      customizedColumnDefsArray.push({
        field: column.colId,
        headerName: column.colId,
        hide: !column.visible,
        show: column.visible,
        width: column.actualWidth
      });
    });
    //this.columnDefs = customizedColumnDefsArray;
    localStorage.setItem(
      "UserColumnDefs",
      JSON.stringify(customizedColumnDefsArray)
    );
    console.log(JSON.stringify(customizedColumnDefsArray));
  }

  formatColumnName(name: string) {
    return name.replace(".", " ").replace("_", " ");
  }

  datefy(utc: any) {
    var date = new Date(utc);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }

  createColumnDefs() {
    var savedDefs = JSON.parse(localStorage.getItem("UserColumnDefs") || "{}");
    var that = this;
    var emptySavedDefs: boolean =
      Object.entries(savedDefs).length === 0 &&
      savedDefs.constructor === Object;

    if (!emptySavedDefs) {
      //Getting user custom properties from User Data
      var properties: any = {};
      this.rowData.map((user: any) => {
        Object.assign(properties, user.custom_data);
      });

      savedDefs.map((column: any) => {
        delete properties[column.field.substring("custom_data.".length)];
        this.columnDefs.push({
          headerName: this.formatColumnName(column.headerName),
          field: column.field,
          width: column.width,
          hide: column.hide,
          show: !column.hide,
          cellRenderer: function(params: any) {
            // Date
            if (
              params.value &&
              params.value.includes &&
              params.value.includes("Z")
            )
              return that.datefy(params.value);

            // Default
            if (column.field !== "identification") return params.value;

            console.log(params.value);
            //return '<a href="/user/'+params.value+'">'+ params.value+'</a>'
            const route = {
              name: "route-name",
              params: { id: params.value }
            };

            const link = document.createElement("a");
            link.href = router.resolve(route).href + "/user/" + params.value;
            link.innerText = params.value;
            link.addEventListener("click", e => {
              e.preventDefault();
              router.push("/user/" + params.value);
            });
            return link;
          }
        });
      });
      var userCustomDataArray = Object.keys(properties);
      userCustomDataArray.map(property => {
        this.columnDefs.push({
          headerName: property,
          field: "custom_data." + property,
          width: 120,
          hide: true,
          show: false
        });
      });
      console.log(userCustomDataArray);
    } else {
      this.columnDefs = [
        {
          headerName: "Name",
          field: "name",
          width: 100,
          hide: false,
          show: true
        },
        {
          headerName: "Identificaiton",
          field: "identification",
          width: 120,
          hide: false,
          show: true,
          cellRenderer: function(params: any) {
            //return '<a href="/user/'+params.value+'">'+ params.value+'</a>'
            const route = {
              name: "route-name",
              params: { id: params.value }
            };

            const link = document.createElement("a");
            link.href = router.resolve(route).href + "/user/" + params.value;
            link.innerText = params.value;
            link.addEventListener("click", e => {
              e.preventDefault();
              router.push("/user/" + params.value);
            });
            return link;
          }
        },
        { headerName: "Ip", field: "ip", width: 120, hide: false, show: true },
        {
          headerName: "Updated",
          field: "updated",
          width: 120,
          hide: false,
          show: true,
          filter: "agDateColumnFilter"
        },
        {
          headerName: "Events",
          field: "events.length",
          width: 80,
          hide: false,
          show: true,
          filter: "agNumberColumnFilter"
        },
        {
          headerName: "Revenue",
          field: "revenue",
          width: 80,
          hide: false,
          show: true,
          filter: "agNumberColumnFilter"
        }
      ];

      //Getting user custom properties from User Data
      var properties: any = {};
      this.rowData.map((user: any) => {
        Object.assign(properties, user.custom_data);
      });
      console.log(properties);
      var userCustomDataArray = Object.keys(properties);

      userCustomDataArray.map(property => {
        this.columnDefs.push({
          headerName: property,
          field: "custom_data." + property,
          width: 120,
          hide: true,
          show: false
        });
      });
    }
  }

  getData() {
    UserService.getUsers().then(res => {
      var users = res.data;
      users.sort(function(a: any, b: any) {
        return +new Date(b.updated) - +new Date(a.updated);
      });
      this.rowData = users;
      console.log(users);

      this.createColumnDefs();
      /*this.notTransfered = this.users.filter(user => {
            return !user.transfered_to;
        })*/
      //console.log(this.users);
    });
  }

  isColumnVisible(e: number) {
    return true;
  }

  columnVisibility(e: number) {
    console.log("Changing column visibility " + e);
    var currentVisibility = this.columnDefs[e].hide;
    this.columnDefs[e].hide = !currentVisibility;
    this.columnDefs[e].show = currentVisibility;
    this.gridOptions.columnApi.setColumnVisible(
      this.columnDefs[e].field,
      !!currentVisibility
    );

    var savedDefs: any = {};
    this.columnDefs.map((def: any) => {
      savedDefs[def.field] = def;
    });
    localStorage.setItem("UserColumnDefs", JSON.stringify(savedDefs));
    //console.log(savedDefs);
    //this.gridOptions.columnApi.setColumnDefs(this.columnDefs);
  }

  enableScrollWithMouseTable() {
    // Scrolling with mouse
  }

  mounted() {
    console.log("MOUNTED");
    const slider: any = document.querySelector(".ag-center-cols-viewport");
    const sliders: any = document.querySelector(".ag-body-viewport");
    console.log(slider);
    let isDown = false;
    let startX: number;
    let startY: number;
    let scrollLeft: number;
    let scrollTop: number;

    if (slider) {
      slider.addEventListener("mousedown", (e: any) => {
        isDown = true;
        slider.classList.add("active");
        startX = e.pageX - slider.offsetLeft;
        startY = e.pageY - slider.offsetTop;
        scrollLeft = slider.scrollLeft;
        scrollTop = sliders.scrollTop;
      });
      slider.addEventListener("mouseleave", () => {
        isDown = false;
        slider.classList.remove("active");
      });
      slider.addEventListener("mouseenter", () => {
        isDown = true;
        slider.classList.add("active");
      });
      slider.addEventListener("mouseup", () => {
        isDown = false;
        slider.classList.remove("active");
      });
      slider.addEventListener("mousemove", (e: any) => {
        if (!isDown) return;
        e.preventDefault();
        const x = e.pageX - slider.offsetLeft;
        const y = e.pageY - slider.offsetTop;
        const walkX = (x - startX) * 1; //scroll-fast
        const walkY = (y - startY) * 1; //scroll-fast
        slider.scrollLeft = scrollLeft - walkX;
        sliders.scrollTop = scrollTop - walkY;
        console.log(walkY);
      });
    }
  }

  beforeMount() {
    this.gridOptions = {};
    this.getData();
  }
}
</script>

<style>
.ag-header-icon.ag-header-cell-menu-button {
  display: none;
}
div.ag-header-cell.ag-header-cell-sortable {
  padding: 0 6px;
}
.ag-header-cell-text {
  width: 100%;
}
.ag-header-cell-text {
  text-transform: capitalize;
}
.ag-theme-material .ag-header-row:first-child .ag-header-cell {
  border-right: 1px #f1f1f1 solid;
  border-top: 1px #f4f4f4 solid;
}
.ag-root.ag-layout-normal {
  border-top: 1px #e6e6e6 solid;
}
.ag-horizontal-left-spacer,
.ag-horizontal-right-spacer {
  overflow-x: auto;
}
#select_columns .v-card.v-sheet div.v-card__text,
#select_columns .v-card.v-sheet div.v-card__title,
#select_columns .v-card.v-sheet div.v-card__actions {
  background: white;
}
#select_columns .v-input.v-input--selection-controls {
  margin-top: 0;
}
#select_columns .v-input__slot {
  margin-bottom: 0;
}
.v-list.theme--light {
  max-height: 40vh;
  overflow-y: scroll;
  padding: 20px;
}
#select_columns .theme--light.v-subheader {
  height: 20px;
  margin-bottom: 10px;
  padding: 0;
}
#change_visibility > div {
  float: left;
  width: 100%;
}
#change_visibility label {
  text-transform: capitalize;
}
@media only screen and (min-width: 1266px) {
  #change_visibility > div {
    width: 33%;
  }
}
</style>
