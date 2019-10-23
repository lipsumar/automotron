<template>
  <div class="homepage">
    <div class="hero">
      <router-link :to="`/admin`" class="btn btn--primary admin-btn" v-if="user && user.role==='admin'">Admin</router-link>
      <h1 class="hero__title">Automotron</h1>
      <div class="hero__buttons">
        <div class="hero__welcome" v-if="user">Welcome @{{user.username}}</div>
        <router-link :to="`/graph`" class="btn btn--primary" v-if="user">New generator</router-link>
        <a href="https://github.com/lipsumar/automotron/wiki" target="_blank" class="btn ">Documentation</a>
      </div>
    </div>
    <div class="generator-list">
      <router-link :to="`/login`" class="generator-list__item" v-if="!user">Login</router-link>
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
    if(this.user){
      this.$store.dispatch("fetchGeneratorList");
    }
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
  height: 100vh;
  overflow-y: auto;
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
.hero__buttons{
  
  text-align: center;
}

.generator-list {
  margin: 2rem 0;
  text-align: center;
}
.generator-list__item {
  display: inline-block;
  font-size: 1.2rem;
  text-align: center;
  width:300px;
  
  text-align: left;
  background-color: #808cf2;
  color:#fff;
  font-weight: bold;
  margin:1em;
  padding:0.8em;
  text-decoration: none;
}
.hero__welcome{
  font-size: 1.5em;
  margin-bottom:1.4em;
}
.admin-btn{
  position: absolute;
  top:1em;
  right:1em;
}
</style>
