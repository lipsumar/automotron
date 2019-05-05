<template>
  <div>
    <router-view></router-view>
  </div>
</template>

<script>
import eventBus from "../eventBus.js";

export default {
  created() {
    eventBus.$on("newGraph", this.newGraph);
  },
  methods: {
    newGraph() {
      this.$router.push("/board/new");
    }
  }
};
</script>
