<template>
  <form @submit.prevent="submit" class="login">
    <div class="field">
      <label>Username</label>
      <input type="text" v-model="username" autofocus>
    </div>
    <div class="field">
      <label>Password</label>
      <input type="password" v-model="password">
    </div>
    <div class="login__buttons">
      <button type="submit">Login</button>
      <router-link to="/register">Register</router-link>
    </div>
  </form>
</template>

<script>
export default {
  data: function(){
    return {
      username: '',
      password: ''
    }
  },
  methods:{
    submit(){
      this.$api.login(this.username, this.password).then(user => {
        this.$store.commit('loggedIn', user);
        this.$router.push('/')
      })
    }
  }
}
</script>

<style scoped>
.login{
  width: 400px;
  margin: 30vh auto 0;
  padding: 2em;
  background-color: rgba(255, 255, 255, 0.8);
}


.login__buttons{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.register{
  color:#4557e8;
}
</style>