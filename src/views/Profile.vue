<template>
    <div id="profile">
        <h1>Profile</h1>

        <h2>Email: {{email}}</h2>
    </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import  authService from "../services/auth";
@Component({
  components: {}
})
export default class Profile extends Vue {
    email: any = "";
    mounted() {
        var userData: {email?: string} = authService.getUserDetails();
        this.email = userData.email;
        console.log(authService.getUserDetails());
    }
}
</script>

<style>

</style>
