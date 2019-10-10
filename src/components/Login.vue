<template>
  <form @submit.prevent="submit" class="login">
    <div class="field">
      <label>Username</label>
      <input type="text" v-model="username">
    </div>
    <div class="field">
      <label>Password</label>
      <input type="password" v-model="password">
    </div>
    <button type="submit">Login</button>
  </form>
</template>

<script>
export default {
  data: function(){
    return {
      username: 'lipsumar',
      password: 'password'
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
.login input{
  display: block;
  width: 100%;
  font-size:1.2em;
  padding:0.4em 0.6em;
  border:1px solid rgb(220, 220, 220);
}
.login button{
  border:none;
  background-color: #eee;
  padding: 0.5em 1em;
  display: block;
  font-size:1em;
  border:1px solid rgb(220, 220, 220);
}
.field{
  margin-bottom:2em;
}
</style>