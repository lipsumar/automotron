<template>
  <div>
    <router-view v-if="ready"></router-view>
  </div>
</template>

<script>
export default {
  data:function(){
    return {
      ready: false
    }
  },
  created(){
    this.$api.loggedIn().then(user => {
      this.$store.commit('loggedIn', user);
      this.ready = true
    })

    this.$store.subscribe((mutation, state) => {
      if(mutation.type==='saveEditorGraphSuccess'){
        this.$toasted.show('saved', {icon: 'check'})
      }
    })
  },
};
</script>
