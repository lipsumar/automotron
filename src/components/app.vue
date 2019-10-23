<template>
  <div>
    <router-view v-if="ready"></router-view>
  </div>
</template>

<script>
import * as Sentry from '@sentry/browser';
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
      Sentry.configureScope(function(scope) {
        scope.setUser({username: user.username, id: user._id});
      });
    })

    this.$store.subscribe((mutation, state) => {
      if(mutation.type==='saveEditorGraphSuccess'){
        this.$toasted.show('saved', {icon: 'check'})
      }
    })
  },
};
</script>
