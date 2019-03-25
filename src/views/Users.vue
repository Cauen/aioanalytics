<template>
  <div>
    <v-card>
      <v-card-title>
        Users
        <v-spacer></v-spacer>
        <v-text-field
          v-model="search"
          append-icon="search"
          label="Search"
          single-line
          hide-details
        ></v-text-field>
      </v-card-title>
      <v-data-table
        :headers="headers"
        :items="notTransfered"
        :search="search"
        :pagination.sync="pagination"
        :rows-per-page-items="pagination.rowsPerPageItems"
      >
        <template v-slot:items="props">
          <td class="text-xs-left">{{ props.item.name || 'Anon' }}</td>
          <router-link :to="'/user/'+props.item.identification">
            <td class="text-xs-left">{{ props.item.identification }}</td>
          </router-link>
          <td class="text-xs-left">{{ props.item.initial_referrer }}</td>
          <td class="text-xs-left">{{ props.item.initial_page }}</td>
          <td class="text-xs-left">{{ datefy(props.item.updated) }}</td>
          <td class="text-xs-left">{{ props.item.events.length }}</td>
          <td class="text-xs-left">{{ props.item.revenue }}</td>
        </template>
        <v-alert
          v-slot:no-results
          :value="true"
          color="error"
          icon="warning"
        >Your search for "{{ search }}" found no results.</v-alert>
      </v-data-table>
    </v-card>
  </div>
</template>
<style>
body {
  background: #e5eef4;
}
tr a {
  text-decoration: none;
  vertical-align: middle;
  color: #087ece;
}
</style>
<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import User from "../services/users";
@Component({})
export default class About extends Vue {
  message: string = "Hello!";
  users: any[] = [];
  notTransfered: any[] = [];
  search: string = "";
  headers: any[] = [
    {
      text: "Name",
      align: "left",
      value: "name"
    },
    { text: "Identification", value: "identification" },
    { text: "referrer", value: "referrer" },
    { text: "First Page", value: "first_page" },
    { text: "Last Track", value: "lastrack" },
    { text: "Event Count", value: "eventcount" },
    { text: "Revenue", value: "revenue" }
  ];
  pagination: {} = {
    descending: true,
    page: 1,
    rowsPerPage: 10,
    sortBy: "lastrack",
    totalItems: 0,
    rowsPerPageItems: [10, 20, 40, 80, 160]
  };

  datefy(utc: any) {
    var date = new Date(utc);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  }
  getUsers() {
    User.getUsers().then(res => {
      var users = res.data;
      users.sort(function(a : any, b: any) {
        return +new Date(b.updated) - +new Date(a.updated);
      });
      this.users = users;
      this.notTransfered = this.users.filter(user => {
        return !user.transfered_to;
      })
      //console.log(this.users);
    });
  }
  mounted() {
    var that = this;
    that.getUsers();
    setInterval(function(){ that.getUsers(); }, 1000);
  }
}
</script>