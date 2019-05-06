<template>
  <div class="message-box dialog-mask">
    <div class="dialog-content">
      <header>{{ title }}</header>
      <div class="dialog-body">
        <p>{{ content }}</p>
        <input type="text" class="el-input" v-model="input" ref="input">
      </div>
      <footer>
        <button class="el-button" type="text" size="mini" @click="$close(false)">Cancel</button>
        <button class="el-button" type="text" size="mini" @click="$close(input)">Save</button>
      </footer>
    </div>
  </div>
</template>

<script>
export default {
  props: ["title", "content"],
  data:function(){
    return {input: ''}
  },
  mounted(){
    this.$refs.input.focus()
  }
};
</script>

<style>
.message-box .dialog-content {
  min-width: 240px;
  text-align: center;
  font-size: 16px;
}
.dialog-mask {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  display: -ms-flexbox;
  display: flex;
  -ms-flex-align: center;
  align-items: center;
  -ms-flex-pack: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.33);
}
.dialog-content {
  margin: 0 20px;
  padding: 20px 30px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  background-color: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  color: #303133;
}
.dialog-content header {
  margin: 10px 0 26px;
  font-size: 18px;
  font-weight: 700;
}
.dialog-content .el-button,
.dialog-content p {
  font-size: inherit;
}
.dialog-content p {
  white-space: pre-wrap;
}
.dialog-content .el-button {
  -ms-flex: 1;
  flex: 1;
  border: 0;
  color: #409eff;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}
.dialog-content footer {
  display: -ms-flexbox;
  display: flex;
  margin-top: 24px;
}
.message-box .dialog-content {
  min-width: 240px;
  text-align: center;
  font-size: 16px;
}

.el-button {
  -webkit-user-select: none;
  -moz-user-select: none;
  font-weight: 500;
}
.el-button {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  color: #606266;
  -webkit-appearance: none;
  text-align: center;
  box-sizing: border-box;
  outline: 0;
  margin: 0;
  transition: 0.1s;
  padding: 12px 20px;
  font-size: 14px;
  border-radius: 4px;
}
.el-button + .el-button {
  margin-left: 10px;
}
.el-button:focus,
.el-button:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}
.el-button:active {
  color: #3a8ee6;
  border-color: #3a8ee6;
  outline: 0;
}
.el-button::-moz-focus-inner {
  border: 0;
}

.el-input {
  width: 100%;
  border-radius: 5px;
  border: 1px solid #ccc;
  font-size: 2em;
  padding: 0.3em 0.5em;
  box-sizing: border-box;
  font-weight: 300;
  outline: none;
}
</style>
