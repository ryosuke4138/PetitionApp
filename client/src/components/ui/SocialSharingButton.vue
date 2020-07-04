<template>
  <vue-goodshare-facebook
    page_url="https://github.com/koddr/vue-goodshare"
    title_social="Facebook"
    has_counter
    has_icon
  ></vue-goodshare-facebook>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import VueGoodshareFacebook from "vue-goodshare/src/providers/Facebook.vue";

@Component({
  name: "socialSharingButton",
  components: {
    VueGoodshareFacebook
  }
})
export default class extends Vue {}
</script>
