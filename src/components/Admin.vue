<template>
  <div class="container">
    <h1>Admin</h1>
    <div v-if="user">
      <div v-if="users">
        <table class="table">
          <thead>
            <tr>
              <th>id</th>
              <th>username</th>
              <th>graphs</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id">
              <td>
                <code>{{user._id}}</code>
              </td>
              <td>
                <router-link :to="`/admin/user/${user._id}`">
                  {{user.username}}
                </router-link>
              </td>
              <td>{{user.graphCount}}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div v-else>please <router-link to="/login">login</router-link></div>
  </div>
</template>

<script>
export default {
  created(){
    this.fetchUsers()
  },
  data: function(){
    return {
      users: null,
    }
  },
  computed:{
    user(){
      return this.$store.state.user;
    }
  },
  methods: {
    fetchUsers(){
      this.$api.getUsers().then(users => {
        this.users = users;
      })
    }
  }
}
</script>