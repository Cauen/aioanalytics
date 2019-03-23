<template>
  <div>
    <div
      class="aio-container"
      grid-list-md
      text-xs-center
    >
      <v-layout
        row
        wrap
      >

        <v-flex md7>
          <div id="left">
            <div class="user_profile_header">
              <div class="avatar"> <img src="https://secure.gravatar.com/avatar/5029db0b10cf5b96342c6b39bc88979d?d=https%3A%2F%2Fcdn4.mxpnl.com%2Fstatic%2Fasset-cache%2F1dd2253ed486f6bac3aa9debb39647d2%2Fimages%2Fengage%2Fuser_profile_image_light.png&amp;s=96"> </div>
              <div class="summary">
                <div class="name">{{userdata.name || 'Anonymous'}}</div>
                <div class="user_info_field email">
                  <v-icon class="user-icon">email</v-icon>
                  <div class="text"><a
                      href="mailto:juse@juseexample.com"
                      title="juse@juseexample.com"
                    >{{userdata.email || "Without email"}}</a></div>
                </div>
                <div class="user_info_field location">
                  <v-icon class="user-icon">place</v-icon>
                  <div class="text">Quixada, Ceara, Brazil</div>
                </div>
                <div class="user_info_field last_seen">
                  <v-icon class="user-icon">attach_money</v-icon>
                  <div class="text">{{userdata.revenue || '0'}}</div>
                </div>
              </div>
              <div class="action_buttons">

                <v-icon class="user-action">home</v-icon>
                <v-icon class="user-action">event</v-icon>
                <v-icon class="user-action">info</v-icon>
              </div>
            </div>

            <div id="events">
              <div class="d-flex justify-between align-center mb-3">
                <v-btn
                  class="aio-button"
                  @click="all"
                >all</v-btn>
                <v-btn
                  class="aio-button"
                  @click="none"
                >none</v-btn>
              </div>
              <v-expansion-panel
                v-model="panel"
                expand
              >
                <v-expansion-panel-content
                  class="aio-unique-event"
                  v-for="(item,i) in events"
                  :key="i"
                >
                  <template v-slot:header>
                    <div class="date">{{ datefy(item.date) }}</div>
                    <div
                      class="color_circle"
                      :style="'border: 5px '+stringToColour(item.name)+' solid;width: 5px !important;max-width: 5px !important;border-radius: 100%;margin: 0 10px;'"
                    >
                      <div class="inner_circle"></div>
                    </div>
                    <div
                      style="color: #6d859e;"
                      class="name"
                    >{{ item.name }}</div>
                  </template>
                  <div class="properties">
                    <div
                      class="property"
                      v-for="(property, i) in item.data"
                      :key="i"
                    >
                      <span class="property_name">{{i}}: </span><span class="property_value">{{ property }}</span>
                    </div>
                  </div>
                </v-expansion-panel-content>
              </v-expansion-panel>
            </div>
          </div>
        </v-flex>
        <v-flex
          md5
          id="aio-right-flex"
        >
          <div id="user_properties">
            <h3>Properties</h3>
            <table style="width: 100%">
              <tbody id="custom_data">
                <tr
                  class="important-data"
                  v-for="iData in importantDataArray"
                  :key="iData.id"
                >
                  <td v-if="iData[1]">{{ iData[0] }}</td>
                  <td v-if="iData[1]">{{ datefy(iData[1]) }}</td>
                </tr>
                <tr
                  class="custom-data"
                  v-for="cData in custom_dataArray"
                  :key="cData.id"
                >
                  <td v-if="cData[1]">{{ cData[0] }}</td>
                  <td v-if="cData[1]">{{ datefy(cData[1]) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </v-flex>

      </v-layout>
    </div>

  </div>
</template>

<style>
body {
  background: #e5eef4;
}

#events {
  padding: 20px;
}

#events .event {
  padding: 10px 0;
}

tr td {
  padding: 10px 0;
  border-top: 1px solid #e5eef4;
}

.property {
  padding: 10px;
  padding: 10px;
  flex: 50%;
  background: #f4f9fd;
  border: 1px #e4e4e4 solid;
}

.properties {
  display: flex;
  flex-flow: row wrap;
}

.property_name {
  color: #6d859e;
}

.property_value {
  color: #4c6072;
}

#user_properties {
  border: 1px solid #d8e0ea;
  border-radius: 5px;
  border-top: #4ba8ff 3px solid;
  margin: 14px;
}

#user_properties h3 {
  color: #4c6072;
  padding: 14px 0;
}

.user_profile_header {
  background-color: #f4f9fd;
  padding: 16px;
  border-bottom: 1px solid #e5eef4;
  position: relative;
  display: flex;
}

.avatar {
  border: 4px solid white;
  box-shadow: 0 1px 2px 0 #c8cad2;
  display: -webkit-inline-box;
  vertical-align: middle;
  margin: 5px 17px 5px 5px;
  border-radius: 4px;
  float: left;
}

.summary {
  color: #6d859e;
  display: inline-block;
  vertical-align: middle;
  width: 60%;
  float: left;
  text-align: left;
  margin: 10px 0;
}

.user-action {
  padding: 3px;
  display: inline-block;
  width: 33px;
  height: 29px;
  background-position: 0 -29px;
  cursor: pointer;
  border-radius: 4px;
  margin: 2px;

  box-shadow: 0 1px 1px 0 rgba(216, 224, 234, 0.5) !important;
  border: 1px #d8e0ea solid;
  color: #6d859e !important;
  background: white !important;
}

.action_buttons {
  width: 50%;
}

img {
  vertical-align: middle;
}

#aio-right-flex {
  border-left: 1px #e3e3e3 solid;
  box-shadow: inset 0 3px 3px #e5eef4;
}

.aio-button {
  box-shadow: 0 1px 1px 0 rgba(216, 224, 234, 0.5) !important;
  border: 1px #d8e0ea solid;
  color: #6d859e !important;
  font-weight: 600;
  text-transform: capitalize;
  background: white !important;
}

.date {
  color: #6d859e;
}

.user-icon {
  font-size: 16px;
  float: left;
}

.user_info_field {
  padding: 2px 4px;
}

.user_profile_header .text {
  padding-left: 20px;
}

.user_profile_header .name {
  font-size: 20px;
  margin-bottom: 7px;
}
</style>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import userService from "../services/users";

@Component({})
export default class User extends Vue {
  userid: string = "";
  userdata: any[] = [];
  events: any[] = [];
  custom_dataArray: any[] = [];
  importantDataArray: any[] = [];
  panel: any[] = [];

  stringToColour(str) {
    for (
      var i = 0, hash = 0;
      i < str.length;
      hash = str.charCodeAt(i++) + ((hash << 5) - hash)
    );
    var color = Math.floor(
      Math.abs(((Math.sin(hash) * 10000) % 1) * 16777216)
    ).toString(16);
    return "#" + Array(6 - color.length + 1).join("0") + color;
  }

  datefy(utc) {
    var date = new Date(utc);
    if (Date.parse(utc) > 1)
      return date.toLocaleDateString() + " " + date.toLocaleTimeString();
    return utc;
  }

  all() {
    this.panel = [...Array(this.events.length).keys()].map(_ => true);
  }
  // Reset the panel
  none() {
    this.panel = [];
  }

  mounted() {
    this.userid = this.$route.params.id;
    userService.getUser(this.$route.params.id).then(res => {
      this.userdata = res.data;
      this.events = res.data.events.reverse();

      var custom_data = res.data.custom_data;
      this.custom_dataArray = Object.entries(custom_data);
      this.importantDataArray = Object.entries({
        ip: this.userdata.ip,
        name: this.userdata.name,
        email: this.userdata.email,
        number: this.userdata.number,
        revenue: this.userdata.revenue,
        device_id: this.userdata.device_id,
        session_id: this.userdata.session_id,
        initial_page: this.userdata.initial_page,
        initial_referer: this.userdata.initial_referer
      });

      console.log(this.userdata);
      console.log(this.events);
    });
  }
}
</script>
