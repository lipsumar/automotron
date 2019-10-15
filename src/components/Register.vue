<template>
  <form @submit.prevent="submit" class="register">
    <div class="field">
      <label>Username</label>
      <input type="text" v-model="username">
    </div>
    <div class="field">
      <label>Password</label>
      <input type="password" v-model="password">
    </div>
    <div class="field">
      <label>Password, again</label>
      <input type="password" v-model="password2" :class="{error:password!==password2}">
    </div>
    <div class="register__buttons">
      <button type="submit">Register</button>
      <router-link to="/login">Login</router-link>
    </div>
  </form>
</template>

<script>
export default {
  data: function(){
    return {
      username: '',
      password: '',
      password2: '',
    }
  },
  created(){
    //if(this.)
  },
  methods:{
    submit(){
      if(this.password !== this.password2) return
      this.$api.register(this.username, this.password).then(user => {
        if(user.error){
          alert(user.data)
          return
        }
        this.$store.commit('loggedIn', user);
        this.$router.push('/')
      })
    }
  }
}
</script>

<style scoped>
.register{
  width: 400px;
  margin: 20vh auto 0;
  padding: 2em;
  background-color: rgba(255, 255, 255, 0.8);
}


.register__buttons{
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>