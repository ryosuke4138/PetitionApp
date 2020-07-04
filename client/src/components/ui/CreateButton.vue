<template>
  <v-btn
    @click="() => this.$emit('click')"
    :disabled="disabled"
    class="mx-2"
    fab
    dark
    color="indigo"
  >
    <v-icon dark>mdi-plus</v-icon>
  </v-btn>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component({
  name: "createButton"
})
export default class extends Vue {
  @Prop({}) private disabled = false;
}
</script>
