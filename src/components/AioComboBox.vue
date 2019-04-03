<template>
 <v-combobox
    v-model="select"
    :items="items"
    :search-input.sync="search"
    hide-selected
    hint="Enter to create new"
    label="Select a property name"
    persistent-hint
    small-chips
  >
    <template v-slot:no-data>
      <v-list-tile>
        <v-list-tile-content>
          <v-list-tile-title>
            <kbd>Enter</kbd> to create to create "<strong>{{ search }}</strong>"
          </v-list-tile-title>
        </v-list-tile-content>
      </v-list-tile>
    </template>
  </v-combobox>
</template>

<script lang="ts">
import { Component, Prop, Vue, Watch, Model } from "vue-property-decorator";
@Component({
  name: "AioComboBox",
})

export default class AioComboBox extends Vue {
  
  @Prop() private items!: string[];
  @Prop() private proppos!: number[];
  @Prop() private steppos!: number[];

  @Watch('select')
  onSelectedChanged(val: [], oldVal: string) {
    console.log(val);
    this.$emit('selected-prop-name', {val:val, pos: this.proppos, steppos: this.steppos})
  }
  select: string = "";
  /*items: string[] = [
    'Programming',
    'Design',
    'Vue',
    'Vuetify'
  ];*/
  search: string = "";
 
}
</script>

<style>
.v-menu__content.theme--light.menuable__content__active.v-autocomplete__content, .v-menu__content.theme--light.menuable__content__active {
    top: 50px !important;
    left: 0 !important;
}
</style>
