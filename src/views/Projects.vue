<template>
  <div id="projects">
    <h1>Projects</h1>
    <v-list subheader>
      <v-list-tile
        v-for="project in projects"
        :key="project._id"
        avatar
        @click="projectSelected(project._id)"
      >
        <v-list-tile-avatar>
          <img :src="imagesrc">
        </v-list-tile-avatar>

        <v-list-tile-content>
          <v-list-tile-title v-html="project.name"></v-list-tile-title>
        </v-list-tile-content>

        <v-list-tile-action>
          <v-icon :color="project._id == selectedProject ? '#087ccd' : 'grey'">gps_fixed</v-icon>
        </v-list-tile-action>
      </v-list-tile>
    </v-list>
    <v-form v-model="valid">
      <v-layout>
        <v-flex
          xs12
          md10
          offset-md1
        >
          <v-text-field
            v-model="name"
            :rules="nameRules"
            :counter="10"
            label="Project name"
            required
          ></v-text-field>
        </v-flex>
      </v-layout>
      <v-btn @click="submit">Create</v-btn>
    </v-form>
  </div>
</template>

<script lang='ts'>
import { Component, Vue } from "vue-property-decorator";
import authService from "../services/auth";
import ProjectService from "../services/projects";
@Component({})
export default class Projects extends Vue {
    selectedProject = authService.getProject();
  valid: boolean = false;
  name: string = "";
  projects: any = {};
  imagesrc: string =
    "https://cdn.vuetifyjs.com/images/bottom-sheets/messenger.png";
  nameRules: any = [
    (v: any) => !!v || "Name is required",
    (v: any) => v.length <= 10 || "Name must be less than 10 characters"
  ];

  projectSelected(id: string) {
    authService.setProject(id);
    this.selectedProject = id;
    console.log("Project selected " + id);
  }

  submit() {
    if (this.name)
      ProjectService.addProject(this.name).then(res => {
        var resp: any = res;
        if (resp.data.success) {
          this.projects.push(res.data.success);
          this.projectSelected(res.data.success._id)
        }
      });
  }
  mounted() {
    ProjectService.getProjects().then(res => {
      this.projects = res.data;
    });
  }
}
</script>

<style>
</style>
