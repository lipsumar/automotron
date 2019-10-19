<template>
  <div class="container">
    <div v-if="user">
      <div v-if="theUser">
        <h1>@{{theUser.username}}</h1>
        <p>Role: {{theUser.role}}</p>

        <table class="table">
          <thead>
            <tr>
              <th>id</th>
              <th>name</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="graph in graphs" :key="graph._id">
              <td>
                <code>{{graph._id}}</code>
              </td>
              <td>
                <router-link :to="`/graph/${graph._id}`">
                  {{graph.name}}
                </router-link>
              </td>
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

  props:['userId'],
  created(){
    this.fetchUser()
  },
  data: function(){
    return {
      theUser: null,
      graphs: null
    }
  },
  computed:{
    user(){
      return this.$store.state.user;
    }
  },
  methods: {
    fetchUser(){
      this.$api.getUserAndGraphs(this.userId).then(user => {
        this.theUser = user.user;
        this.graphs = user.graphs;
      })
    }
  }
}
</script>