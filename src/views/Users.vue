<template>
  <div>
    <h1 style="padding: 20px 0;">Users</h1>
    <user-list></user-list>
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
import UserList  from "../components/UserList.vue";
import User from "../services/users";
@Component({
  components: {
    UserList
  }
})
export default class About extends Vue {
  mounted() {

  }
}
</script>