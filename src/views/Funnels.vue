<template>
  <div id="funnels">
    <h1>Funnels</h1>
    <v-switch style="text-align: center;" v-model="relativeToAll" label="Relative to all"></v-switch>
    <div class="funnel" v-for="(funnel, key, index) in funnels" :key="index">
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
        <div class="funnel-data" v-for="(step, keystep, indexstep) in funnel.steps" :key="indexstep">
            <div class="event-name">{{step.name}}</div>
            <div class="event-index"><div>{{keystep+1}}</div></div>
            
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
    .funnel-data > div{
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
</style>
<script lang="ts">
interface Funnel {
    name: string;
    steps: [{
        name: string,
        properties?: {}[]
    }];
}

import { Component, Vue } from "vue-property-decorator";
import UserService from "../services/users";
@Component({})
export default class Funnels extends Vue {
    relativeToAll: boolean = true;
    funnels: {name: string, steps: {name:string}[], users?: any}[] = [];
    usersData: {identification:string, name?: string, events: [{name: string}]}[] = [];
    mounted() {
        this.getFunnels();
        this.getUsersData();
    }

    totalFunnel(key: number) {
        if (this.relativeToAll)
        return this.usersData.length/100;
        else {
            return this.getUsersInStep(key, 1)/100;
        }
    }

    getUsersInStep(key: number, step: number) {
        var funnel = this.funnels[key];
        if (funnel.users && step == -1)
            return funnel.users[funnel.users.length-1].length;
        var qnt = 0;
        if (funnel.users)
        for (var x = step; x < funnel.users.length; x++) {
            qnt += funnel.users[x].length;
        }
        return qnt;
    }

    getFunnels() {
        this.funnels = 
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
        ];
    }

    searchForEvents() {
        var funnels = this.funnels;
        console.log('Searching for events');
        console.log(this.usersData);
        for (var f=0; f < funnels.length; f++) {
            var funnel = funnels[f];
            funnel.users = [];
            for (var st = 0; st <= funnel.steps.length; st++)
                funnel.users[st] = [];
            for (var u = 0; u < this.usersData.length; u++) {
                var user = this.usersData[u];
                var step = 0;
                for (var e=0; this.usersData[u].events && e < this.usersData[u].events.length; e++) {
                    if (funnel.steps.length == step)
                        break;
                    var currentEvent = this.usersData[u].events[e].name;
                    var currentStep = funnels[f].steps[step].name;
                    if (currentEvent == currentStep) {
                        step++;
                    }
                }
                var username = user.name;
                var stepname = step + '/' + funnel.steps.length;
                var funnelname = funnel.name;
                console.log(username + ' foi até step '+stepname+ ' no funnel ' + funnelname);
                funnel.users[step].push(user.identification);
            }
        }
        console.log(funnels);


    }

    getUsersData() {
        UserService.getUsers().then(res => {
            var users = res.data;
            this.usersData = users;
            console.log(users);
            this.searchForEvents();
        });
    }
}
</script>

