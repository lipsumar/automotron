<template>
  <div class="homepage">
    <div class="hero">
      <h1 class="hero__title">Automotron</h1>
    </div>
    <div class="generator-list">
      <router-link :to="`/login`" class="generator-list__item">Login</router-link>
      <router-link :to="`/graph`" class="generator-list__item" v-if="user">New generator</router-link>
      <hr>
      <div v-if="user">
        <router-link
          :to="`/graph/${g._id}`"
          class="generator-list__item"
          v-for="g in generators"
          :key="g.id"
        >{{g.name}}</router-link>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  created() {
    this.$store.dispatch("fetchGeneratorList");
  },
  computed: {
    generators() {
      return this.$store.state.generatorList.data;
    },
    user(){
      return this.$store.state.user;
    }
  }
};
</script>

<style>
.homepage {
  height: 100%;
}

.hero {
  background-color: #fff;
  padding: 10vh 1rem;
  box-shadow: 0 1px 6px 0px rgba(0, 0, 0, 0.12);
}
.hero__title {
  text-align: center;
  font-size: 8vw;
  margin: 0;
}

.generator-list {
  margin: 2rem 0;
}
.generator-list__item {
  display: block;
  font-size: 2rem;
  text-align: center;
}
</style>
