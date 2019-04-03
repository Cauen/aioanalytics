<template>

  <div id="funnels">
    <div
      :style="'width:'+drawerWidth+'px;'"
      id="draw_funnels"
    >
      <v-card class="mx-auto">
        <v-card-title>
          <div class="drawer-header"><a
              href="javascript:void(0)"
              class="closebtn"
              @click="closeDrawFunel()"
            >&times;</a></div>
          <v-icon
            large
            left
          >
            mdi-twitter
          </v-icon>
          <span class="title font-weight-light">Create Funnel</span>
        </v-card-title>

        <v-card-text class="headline font-weight-bold">
          <v-text-field v-model="createFunnel.funnelName">
            <template v-slot:label>
              Funnel <strong>name</strong>? <v-icon style="vertical-align: middle">find_in_page</v-icon>
            </template>
          </v-text-field>
          <v-text-field v-model="createFunnel.funnelDescription">
            <template v-slot:label>
              Funnel <strong>description</strong>? <v-icon style="vertical-align: middle">find_in_page</v-icon>
            </template>
          </v-text-field>
          <div id="funnel_steps">
            <h6
              id="steps_title"
              style="color: #4BA8FF;"
            >Steps</h6>
            <div class="steps-parts">
              <div
                class="step"
                v-for="(step, index) in createFunnel.funnelSteps"
                :key="index"
              >
                <div class="step-head">
                  <div class="header-step-name">
                    <h4 class="step-name">Step {{index+1}}</h4>
                  </div>
                  <div
                    @click="addStepFilter(index)"
                    class="add_filter"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                    >
                      <path
                        transform="rotate(45 10.999500274658207,10.999000549316406) "
                        id="svg_1"
                        d="m14.319,6l-3.319,3.319l-3.32,-3.319l-1.68,1.68l3.319,3.319l-3.319,3.319l1.68,1.68l3.32,-3.319l3.319,3.319l1.68,-1.68l-3.319,-3.319l3.319,-3.319l-1.68,-1.68z"
                        fill="#000"
                      /></svg>
                  </div>
                  <div
                    @click="removeStep(index)"
                    class="remove_step"
                  >
                    <svg
                      version="1.1"
                      xmlns="http://www.w3.org/2000/svg"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      width="22"
                      height="22"
                      viewBox="0 0 22 22"
                    >
                      <path
                        fill="#000"
                        d="M14.319 6l-3.319 3.319-3.32-3.319-1.68 1.68 3.319 3.319-3.319 3.319 1.68 1.68 3.32-3.319 3.319 3.319 1.68-1.68-3.319-3.319 3.319-3.319z"
                      ></path>
                    </svg>
                  </div>
                </div>
                <div class="step-content">
                  <v-text-field v-model="createFunnel.funnelSteps[index].name"><template v-slot:label>
                      Event Name
                    </template></v-text-field>
                  <div
                    v-for="(property, indexp) in createFunnel.funnelSteps[index].properties"
                    :key="indexp"
                    class="step-proper"
                  >
                    <div class="step-property">
                      <h6 class="property-key">{{indexp+1}}</h6>
                      <div class="property-content">
                        <aio-combo-box
                          @selected-prop-name="propNameSelected"
                          :steppos="index+0"
                          :proppos="indexp+0"
                          :items="['#$initial_referrer', '#$initial_page']"
                        ></aio-combo-box>
                      </div>
                      <div class="property-content relation">
                        <v-select
                          v-model="property.property_selected"
                          :items="property.property_relation"
                          label="Relation"
                        ></v-select>
                      </div>
                      <v-text-field
                        class="property-content"
                        v-model="property.property_value"
                      ><template v-slot:label>
                          Property Value
                        </template></v-text-field>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <v-btn
              @click="addStep"
              flat
            >Add Step</v-btn>
          </div>
        </v-card-text>

        <v-card-actions>
          <v-list-tile class="grow">
            <v-list-tile-avatar color="grey darken-3">
              <v-img
                class="elevation-6"
                src="https://avataaars.io/?avatarStyle=Transparent&topType=ShortHairShortCurly&accessoriesType=Prescription02&hairColor=Black&facialHairType=Blank&clotheType=Hoodie&clotheColor=White&eyeType=Default&eyebrowType=DefaultNatural&mouthType=Default&skinColor=Light"
              ></v-img>
            </v-list-tile-avatar>

            <v-list-tile-content>
              <v-list-tile-title>Evan You</v-list-tile-title>
            </v-list-tile-content>

            <v-layout
              align-center
              justify-end
            >
              <v-btn
                @click="addFunnel"
                flat
              >Create</v-btn>
            </v-layout>
          </v-list-tile>
        </v-card-actions>
      </v-card>
    </div>
    <h1>Funnels</h1>
    <v-btn
      color="purple"
      dark
      @click="openDrawFunnel"
    >
      Add Funnel
    </v-btn>
    <v-switch
      style="text-align: center;"
      v-model="relativeToAll"
      label="Relative to all"
    ></v-switch>
    <div
      class="funnel"
      v-for="(funnel, key, index) in funnels"
      :key="index"
    >
      <h2 class="funnel-header">{{ funnel.name }}</h2>
      <div class="funnel-subheader">
        <div class="inner">
          <div class="title">All Users</div>
          <div class="content">{{usersData.length}}</div>
        </div>
        <div class="inner">
          <div class="title">Entered</div>
          <div class="content">{{getUsersInStep(key, 1)}}</div>
        </div>
        <div class="inner">
          <div class="title">Completed</div>
          <div class="content">{{getUsersInStep(key, -1)}}</div>
        </div>

      </div>
      <div
        class="funnel-data"
        v-for="(step, keystep, indexstep) in funnel.steps"
        :key="indexstep"
      >
        <div class="event-name">{{step.name}}
           <div class="event-step-properties" v-for="(property,indexprop) in step.properties" :key="indexprop">
                <b>{{property.property_name}}</b> {{property.property_selected}} {{property.property_value}}
            </div> 
        </div>
        
        <div class="event-index">
          <div>{{keystep+1}}</div>
        </div>

        <div class="event-percent">
          <v-progress-linear
            color="blue"
            height="30"
            :value="getUsersInStep(key, keystep+1)/totalFunnel(key)"
          ></v-progress-linear>
        </div>
        <div class="event-qnt">Perfomed: {{getUsersInStep(key, keystep+1)}} ({{(getUsersInStep(key, keystep+1)/totalFunnel(key)).toFixed(2)}}%)</div>
      </div>
    </div>
  </div>
</template>
<style>
.funnel {
  padding: 20px;
}
.funnel-subheader {
  padding-bottom: 20px;
}
.inner {
  width: 33%;
  display: inline-block;
}
.funnel-header {
  margin-bottom: 10px;
}
.funnel-data > div {
  display: inline-block;
}
.funnel-data .event-name {
  width: 20%;
}
.funnel-data .event-index {
  width: 10%;
}
.funnel-data .event-index > div {
  border: 1px #2196f3 solid;
  height: 30px;
  width: 30px;
  text-align: center;
  margin: auto;
  line-height: 30px;
  border-radius: 20px;
}
.funnel-data .event-percent {
  width: 70%;
}
#draw_funnels {
  height: 100%;
  width: 0;
  position: fixed;
  z-index: 1;
  top: 0;
  left: 0;
  background-color: #111;
  overflow-x: hidden;
  transition: 0.5s;
}

#draw_funnels .mx-auto.v-card.v-sheet {
  height: 100%;
}

#draw_funnels a.closebtn {
  padding: 8px 8px 8px 32px;
  text-decoration: none;
  font-size: 25px;
  color: #818181;
  display: block;
  transition: 0.3s;
}

#draw_funnels a.closebtn:hover {
  color: #ff0000;
}

#draw_funnels .closebtn {
  position: absolute;
  top: 0;
  right: 25px;
  font-size: 36px;
  margin-left: 50px;
}

#draw_funnels .v-card__text {
  height: calc(100% - 116px);
  background: #f4f9fd;
  color: #6d859e;
  overflow-y: auto;
}

#draw_funnels .v-card__title,
#draw_funnels .v-card__actions {
  background: white;
  color: #6d859e;
}

#draw_funnels label {
  color: #6d859e;
  font-weight: 300;
}
#draw_funnels .v-input__slot::before {
  border-color: #6d859e;
}
#draw_funnels .theme--light.v-icon {
  color: #6d859e;
}
#draw_funnels button {
  box-shadow: 0 1px 1px 0 rgba(216, 224, 234, 0.5) !important;
  border: 1px #d8e0ea solid;
  color: #6d859e !important;
  font-weight: 600;
  text-transform: capitalize;
  background: white !important;
}
#draw_funnels h6#steps_title {
  border-bottom: 1px #d8e0ea solid;
  background: white;
  padding: 10px 0;
}
#draw_funnels #funnel_steps {
  border: 1px #d8e0ea solid;
  background: white;
  border-radius: 5px;
  border-top: #4ba8ff 3px solid;
}
#draw_funnels .steps-parts {
  padding: 10px 20px;
}

#draw_funnels .step-head {
  display: flex;
  list-style-type: none;
  padding: 0;
  justify-content: flex-end;
  padding: 10px;
  border-bottom: 1px #d8e0ea solid;
}
#draw_funnels .step-content {
  padding: 0 10px 20px;
}
#draw_funnels .header-step-name {
  margin-right: auto;
}
#draw_funnels .remove_step,
#draw_funnels .add_filter {
  cursor: pointer;
  right: 8px;
  top: 8px;
}
#draw_funnels .remove_step path,
#draw_funnels .add_filter path {
  fill: #6d859e;
}
#draw_funnels .remove_step:hover path,
#draw_funnels .add_filter:hover path {
  fill: #4ba8ff;
}
#draw_funnels .step {
  border: 1px #d8e0ea solid;
  border-radius: 3px;
  margin: 10px 0;
}
#draw_funnels .property-content {
  width: calc(30% - 20px);
  display: inline-block;
  margin: 0 10px;
}
#draw_funnels .property-key {
  display: inline-block;
  border: 1px #d8e0ea solid;
  border-radius: 100%;
  width: 5%;
}
</style>
<script lang="ts">
interface Funnel {
  name: string;
  steps: [
    {
      name: string;
      properties?: {}[];
    }
  ];
}

import AioComboBox from "../components/AioComboBox.vue";
import { Component, Vue } from "vue-property-decorator";
import userService from "../services/users";
import projectService from "../services/projects";
import router from "../router";
import authService from "../services/auth";
@Component({
  components: {
    AioComboBox
  }
})
export default class Funnels extends Vue {
  relativeToAll: boolean = true;
  drawerWidth: number = 0;
    //Only search events, if get users and funnels
    readyFunnels: boolean = false;
    readyUsers: boolean = false;

  funnels: {
    name: string;
    steps: { name: string; properties: [] }[];
    users?: any;
  }[] = [];
  projectId: string = "";
  createFunnel: any = {
    funnelName: "",
    funnelDescription: "",
    funnelSteps: []
  };
  usersData: {
    identification: string;
    name?: string;
    events: [{ name: string, data: {value: any}[] }];
  }[] = [];
  mounted() {
    this.projectId = this.$route.params.project;
    this.getFunnels();
    this.getUsersData(); //And search events
  }

  openDrawFunnel() {
    this.drawerWidth = 800;
  }
  closeDrawFunel() {
    this.drawerWidth = 0;
  }
  addStep() {
    this.createFunnel.funnelSteps.push({ name: "", properties: [] });
  }
  addFunnel() {
    projectService.addFunnel(this.projectId, this.createFunnel);
  }
  addStepFilter(index: number) {
    this.createFunnel.funnelSteps[index].properties.push({
      property_name: "",
      property_relation: ["Contains", "Not Contains", "Equal", "Not Equal", "Set", "Not Set"],
      property_selected: ""
    });
  }
  removeStep(index: number) {
    this.createFunnel.funnelSteps.splice(index, 1);
  }
  propNameSelected(value: any) {
    this.createFunnel.funnelSteps[value.steppos].properties[
      value.pos
    ].property_name = value.val;
  }

  totalFunnel(key: number) {
    if (this.relativeToAll) return this.usersData.length / 100;
    else {
      return this.getUsersInStep(key, 1) / 100;
    }
  }

  getUsersInStep(key: number, step: number) {
    var funnel = this.funnels[key];
    if (funnel.users && step == -1)
      return funnel.users[funnel.users.length - 1].length;
    var qnt = 0;
    if (funnel.users)
      for (var x = step; x < funnel.users.length; x++) {
        qnt += funnel.users[x].length;
      }
    return qnt;
  }

  getFunnels() {
    /*this.funnels = 
        [
            {name: 'Funnel A', steps: 
                [
                    {name: 'pageview'},
                    {name: 'Comprou'},
                    {name: 'Contacted'},
                    {name: 'Clicou no Whatsapp'},
                ]
            },
            {name: 'Funnel B', steps: 
                [
                    {name: 'Contacted'},
                    {name: 'Clicou no Whatsapp'},
                ]
            }
        ];*/
    projectService.getFunnels(this.projectId).then(res => {
      var funnels: any = res.data;
      console.log('FUNNELS GET');
      this.funnels = funnels;
      this.readyFunnels = true;
      if (this.readyUsers)
        this.searchForEvents();
      console.log(this.funnels)
    });
  }

  searchForEvents() {
    var funnels = this.funnels;
    console.log(this.funnels)
    // Loop all funnels
    for (var f = 0; f < funnels.length; f++) {
      var funnel = funnels[f];
      funnel.users = [];
      // Loop all funnel steps, and initialize users array of funnel
      for (var st = 0; st <= funnel.steps.length; st++) funnel.users[st] = [];
      // Loop all users of system
      for (var u = 0; u < this.usersData.length; u++) {
        var user = this.usersData[u];
        var step = 0;
        // Loop all events of user
        
        for (var e = 0;this.usersData[u].events && e < this.usersData[u].events.length;e++) {
            
            // If ended steps of event
          if (funnel.steps.length == step) break;
          var currentEvent = this.usersData[u].events[e];
          var currentStep = funnels[f].steps[step];
          var currentStepProperties = currentStep.properties;
          console.log('PROPERTIES');
          console.log(currentStepProperties);
          // If event of the funnel match with user EVENT
          if (currentEvent.name == currentStep.name) {
              
            
              // If haven't properties, only match
            if (!currentStepProperties.length)
            step++;
            // If have properties, need to match all properties
            else {
                // Loop properties
                for (var sp = 0; sp < currentStepProperties.length; sp++) {
                    var currentProperty: any = currentStepProperties[sp];
                    var currentPropertyValue = currentProperty.property_value;
                    var currentPropertyName = currentProperty.property_name;
                    var currentPropertySelectedRelation = currentProperty.property_selected;
                    var currentUserEventValue = currentEvent.data[currentPropertyName].value;
                    console.log(currentUserEventValue +" == ? "+ currentPropertyValue)
                    // If property match
                    if (currentUserEventValue == currentPropertyValue) {
                        step++;
                    }
                }
            }
          }
        }
        var username = user.name;
        var stepname = step + "/" + funnel.steps.length;
        var funnelname = funnel.name;
        funnel.users[step].push(user.identification);
      }
    }
  }

  getUsersData() {
    var project = authService.getProject();
    userService.getUsers(project).then(res => {
      var users = res.data;
      this.usersData = users;
      this.readyUsers = true;
      if (this.readyFunnels)
        this.searchForEvents();
    });
  }
}
</script>

