<template>
  <div id="app">
    <v-card flat>
      <v-toolbar
        color="primary"
        dark
        extended
        flat
      >
        <v-toolbar-side-icon></v-toolbar-side-icon>
        <v-toolbar-title>Aio Analytics</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items class="hidden-sm-and-down">
          <router-link v-if="authService.isLoggedIn()" to="/users"><v-btn flat>Users</v-btn></router-link>
          <router-link v-if="authService.isLoggedIn()" :to="'/project/'+authService.getProject()+'/funnels'"><v-btn flat>Funnels</v-btn></router-link>
          <router-link v-if="authService.isLoggedIn()" to="/projects"><v-btn flat>Projects</v-btn></router-link>
          <router-link v-if="authService.isLoggedIn()" to="/profile"><v-btn flat>Profile</v-btn></router-link>
          <v-btn v-if="authService.isLoggedIn()" @click="logout" flat>Logout {{authService.getUserDetails().email}}</v-btn>
          <!--
          <v-btn flat>Link Two</v-btn>
          <v-btn flat>Link Three</v-btn> -->
        </v-toolbar-items>
      </v-toolbar>

      <v-layout
        row
        pb-2
      >
        <v-flex
          xs10
          offset-xs1
        >
          <v-card class="card--flex-toolbar">
            <v-toolbar
              card
              prominent
            >
              <v-toolbar-title class="body-2 grey--text">Aio Analytics</v-toolbar-title>

              <v-spacer></v-spacer>

              <v-btn icon>
                <v-icon>search</v-icon>
              </v-btn>
              <router-link to="/">
                <v-btn icon>
                  <v-icon>apps</v-icon>
                </v-btn>
              </router-link>

              <router-link to="/users">
                <v-btn icon>
                  <v-icon>more_vert</v-icon>
                </v-btn>
              </router-link>
            </v-toolbar>

            <v-divider></v-divider>
            <div id="content">
              <router-view />
            </div>
          </v-card>
        </v-flex>
      </v-layout>
    </v-card>
  </div>
</template>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}

nav.v-toolbar.primary {
  background: #093bc1 linear-gradient(to right, #093bc1 0%, #06b1d7 100%);
}

.v-toolbar.v-toolbar--card.v-toolbar--prominent.theme--light {
  margin-top: -64px !important;
}

.theme--light.v-sheet {
  background: #ff000000 !important;
}

#content {
  background-color: white;
}

a {
  color: #4ba8ff;
  text-decoration: none;
}

.v-toolbar__items a {
  height: inherit;
}

#app .layout .v-toolbar {
  background-color: white;
  border-bottom: 1px solid #d8e0ea;
  border-radius: 4px 4px 0 0;
  flex-direction: row;
  font-size: 13px;
}
</style>
<script>
import Vue from 'vue'
import Component from 'vue-class-component'
import authService from "./services/auth";
import router from './router';
import auth from './services/auth';

@Component({
  props: {
    propMessage: String
  }
})
export default class App extends Vue {
  authService = authService;
  // lifecycle hook
  mounted () {
  }

  logout () {
    console.log('Log outing');
    authService.logout();
    router.push('auth')
  }
}
</script>